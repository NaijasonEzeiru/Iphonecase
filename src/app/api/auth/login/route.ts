import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";

import { createSession } from "@/lib/auth";
import { compareHash } from "@/lib/crypto";
import { loginSchema } from "@/lib/zodSchema";
import { usersTable } from "@/db/schema";
import { db } from "@/db";

export async function POST(req: Request) {
  const payload = await req.json();
  console.log({ payload });
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  try {
    const { username, password } = parsed.data;
    const u = await db.query.usersTable.findFirst({
      where: or(
        eq(usersTable.email, username),
        eq(usersTable.username, username),
      ),
      with: {
        orders: {
          with: {
            configuration: true,
          },
        },
      },
    });
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

    await createSession({
      userId: u.id,
      email: u.email,
    });
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
