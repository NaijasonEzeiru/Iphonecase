import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { emailVerification, user } from "@/db/schema";
import { compareHash } from "@/lib/crypto";
import { createSession, getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Code is required" },
        { status: 400 },
      );
    }

    const [tokenRecord] = await db
      .update(emailVerification)
      .set({ attempts: sql`${emailVerification.attempts} + 1` })
      .where(
        and(
          eq(emailVerification.userEmail, email),
          gt(emailVerification.expiresAt, new Date()),
        ),
      )
      .returning();

    console.log({ tokenRecord });

    // const [tokenRecord] = await db
    //   .select()
    //   .from(emailVerification)
    //   .where(
    //     and(
    //       eq(emailVerification.userId, userId),
    //       gt(emailVerification.expiresAt, new Date())
    //     )
    //   );

    if (!tokenRecord) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Expired or invalid code",
          },
        },
        { status: 403 },
      );
    }

    if (tokenRecord.attempts > tokenRecord.maxAttempts) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Maximum attempts exceeded. Request for another code",
          },
        },
        { status: 403 },
      );
    }

    const isValid = await compareHash(code, tokenRecord.codeHash);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "invalid_code",
            message: "Invalid code",
          },
        },
        { status: 403 },
      );
    }

    const result = await db.transaction(async (tx) => {
      const [u] = await tx
        .update(user)
        .set({
          emailVerified: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(user.email, email))
        .returning();
      await tx
        .delete(emailVerification)
        .where(eq(emailVerification.id, tokenRecord.id));
      return u;
    });

    const { passwordHash: _passwordHash, ...rest } = result;

    await createSession({
      userId: rest.id,
      email: rest.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
        code: "email_verified_success",
        data: rest,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Code verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "server_error", message: "Internal server error" },
      },
      { status: 500 },
    );
  }
}
