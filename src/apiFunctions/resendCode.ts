import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { emailVerification, user } from "@/db/schema";
import { hashData, generateRandomCode } from "@/lib/crypto";
import { db } from "@/db";
import { Resend } from "resend";
import VerifyEmail from "@/components/emails/verifyEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export const resendVerificationEmail = async (email: string) => {
  try {
    const [u] = await db.select().from(user).where(eq(user.email, email));

    if (!u) {
      //   return NextResponse.json(
      //     {
      //       message: "A new verification code has been sent to your email",
      //       description: "Check your inbox and spam folder",
      //     },
      //     { status: 200 },
      //   );
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Delete any existing verification code
    sendVerificationEmail(email);

    return NextResponse.json(
      {
        message: "A new verification code has been sent to your email",
        description: "Check your inbox and spam folder",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      {
        error: {
          description: "Please try again later.",
          message: "An error occurred while resending the verification email.",
        },
      },
      { status: 500 },
    );
  }
};

export async function sendVerificationEmail(email: string) {
  try {
    await db
      .delete(emailVerification)
      .where(eq(emailVerification.userEmail, email));

    // Generate new code and hash it
    const newCode = generateRandomCode();
    const hashedCode = hashData(newCode);

    // Insert fresh verification record
    await db.insert(emailVerification).values({
      userEmail: email,
      codeHash: hashedCode,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    console.log({ newCode });

    resend.emails.send({
      from: "onboarding@resend.dev",
      to: "jayseehe1035@gmail.com",
      subject: "Verify your email address",
      react: VerifyEmail({ validationCode: newCode, locale: "en" }),
    });
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error);
    throw error; // Rethrow to be caught by caller
  }
}
