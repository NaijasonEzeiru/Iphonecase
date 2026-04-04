import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/zodSchema";
import { db } from "@/db";
import { emailVerification, usersTable } from "@/db/schema";
import { generateRandomCode, hashData } from "@/lib/crypto";
// import { sendEmailVerificationCode } from "@/lib/mailer";
import { cookies } from "next/headers";
import { Resend } from "resend";
import VerifyEmail from "@/components/emails/verifyEmail";

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

  const locale = ((await cookies()).get("NEXT_LOCALE")?.value as "en") || "en";

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Create the user
      const [user] = await tx
        .insert(usersTable)
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
        userEmail: user.email,
      });

      return user;
    });

    console.log({ verificationCode });

    const { passwordHash: _, ...rest } = result;

    // Outside transaction: session + email
    await Promise.all([
      createSession({
        userId: result.id,
        email: result.email,
      }),
      resend.emails.send({
        from: "onboarding@resend.dev",
        to: "jayseehe1035@gmail.com",
        subject: "Verify your email address",
        react: VerifyEmail({ validationCode: verificationCode, locale: "en" }),
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: { user: rest },
        values: {
          displayName: rest.username,
        },
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
          code: "reg_failed",
          message: "Registration failed",
          description: "server_error",
        },
      },
      { status: 500 },
    );
  }
}
