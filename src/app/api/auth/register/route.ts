import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/zodSchema";
import { db } from "@/db";
import { emailVerification, User, user } from "@/db/schema";
import { generateRandomCode, hashData } from "@/lib/crypto";
import { Resend } from "resend";
import VerifyEmail from "@/components/emails/verifyEmail";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const payload = await req.json();
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { username, email, password } = parsed.data;

  const verificationCode = generateRandomCode();
  const hashedToken = hashData(verificationCode);

  console.log({ verificationCode });

  try {
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    let result: User;
    if (existingUser.length > 0) {
      console.log("User with this email already exists, updating record...");
      result = await db.transaction(async (tx) => {
        // 1. Create the user
        const updated = await tx
          .update(user)
          .set({
            passwordHash: hashData(password),
            username: username.toLowerCase(),
          })
          .where(eq(user.email, email))
          .returning();

        console.log("Update result:", updated);

        if (!updated.length) {
          throw new Error("Update returned no rows");
        }

        const u = updated[0];
        console.log("Updated user record in transaction:", { userId: u.id });
        // 2. Create the verification record
        await tx
          .delete(emailVerification)
          .where(eq(emailVerification.userEmail, email));

        // Insert fresh verification record
        console.log("Inserting new verification record for existing user...");
        await tx.insert(emailVerification).values({
          userEmail: u.email,
          codeHash: hashedToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });
        console.log("Updated user and verification record in transaction:", {
          userId: u.id,
        });
        return u;
      });
    } else {
      console.log("No existing user found, creating new record...");
      result = await db.transaction(async (tx) => {
        // 1. Create the user
        const [u] = await tx
          .insert(user)
          .values({
            username: username.toLowerCase(),
            email,
            passwordHash: hashData(password),
          })
          .returning();

        // 2. Create the verification record
        await tx.insert(emailVerification).values({
          codeHash: hashedToken,
          expiresAt: new Date(Date.now() + ONE_DAY_MS),
          userEmail: u.email,
        });
        console.log(
          "Created new user and verification record in transaction:",
          { userId: u.id },
        );
        return u;
      });
    }

    console.log({ result });

    const { passwordHash: _, ...rest } = result;

    // Outside transaction: session + email
    await resend.emails
      .send({
        from: "onboarding@resend.dev",
        to: "jayseehe1035@gmail.com",
        subject: "Verify your email address",
        react: VerifyEmail({
          validationCode: verificationCode,
          locale: "en",
        }),
      })
      .catch((err) => {
        console.error("Failed to send verification email:", err);
      });

    return NextResponse.json(
      {
        success: true,
        data: { user: rest },
        message:
          "Registration successful! A verification code has been sent to your email.",
      },
      { status: 201 },
    );
  } catch (error) {
    const err = error as { cause: { code?: string; constraint?: string } };
    console.error("Registration transaction failed:", error);
    const code = err?.cause?.code;
    const constraint = err?.cause?.constraint;

    if (code === "23505" && constraint) {
      const field = constraint.split("_")[1] || "field";
      return NextResponse.json(
        {
          errors: [
            {
              path: field,
              message: `A user with this ${field} already exists.`,
            },
          ],
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: {
          message: "Registration failed",
          description: "server error",
        },
      },
      { status: 500 },
    );
  }
}
