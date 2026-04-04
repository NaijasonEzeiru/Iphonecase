import { NextResponse } from "next/server";
import { db } from "@/db";
import { createSession, getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { usersTable } from "@/db/schema";

export const GET = async () => {
  // const token = request.cookies.get("access_token")?.value;
  const u = await getSession();
  if (!u) {
    return NextResponse.json({ message: "no credentials" });
  }
  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, u.userId),
      with: {
        orders: {
          with: {
            configuration: true,
          },
        },
      },
    });
    if (!user) {
      return new NextResponse(
        JSON.stringify({
          message: "Invalid credentials",
        }),
        { status: 401 },
      );
    }
    const { passwordHash: _, ...rest } = user;
    if (!user) {
      return new NextResponse(
        JSON.stringify({
          message: "Invalid credentials",
        }),
        { status: 401 },
      );
    }

    await createSession({
      userId: user.id,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        user: rest,
        Message: "logged in successfully",
      },
      { status: 201 },
    );
    return response;
  } catch (err) {
    console.log({ err });
    return new NextResponse(JSON.stringify(err), { status: 500 });
  }
};
