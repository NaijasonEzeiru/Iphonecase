import { createSession } from "@/lib/auth";
import { compareHash } from "@/lib/crypto";
import { loginSchema } from "@/lib/zodSchema";
import { user } from "@/db/schema";
import { db } from "@/db";
import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { sendVerificationEmail } from "@/apiFunctions/resendCode";

export async function POST(req: Request) {
  const payload = await req.json();
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  try {
    const { username, password } = parsed.data;
    console.log({ username, password });
    const u = await db.query.user.findFirst({
      where: or(eq(user.email, username), eq(user.username, username)),
      with: {
        orders: {
          with: {
            configuration: true,
          },
        },
      },
    });
    console.log({ userRecord: u });
    if (!u)
      return NextResponse.json(
        {
          error: {
            message: "Invalid credentials",
          },
        },
        { status: 401 },
      );
    const { passwordHash, ...rest } = u;
    if (!compareHash(password, passwordHash)) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid credentials",
          },
        },
        { status: 401 },
      );
    }
    if (u.emailVerified) {
      await createSession({
        userId: u.id,
        email: u.email,
      });
    } else {
      await sendVerificationEmail(u.email);
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Welcome back!",
        data: rest,
      },
      { status: 200 },
    );
  } catch (err) {
    console.log({ err });
    return new NextResponse(
      JSON.stringify({
        error: {
          message: "Login failed",
        },
      }),
      { status: 500 },
    );
  }
}
