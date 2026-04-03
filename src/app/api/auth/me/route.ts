import { NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/auth";

export const GET = async () => {
  // const token = request.cookies.get("access_token")?.value;
  const u = await getSession();
  if (!u) {
    return NextResponse.json({ message: "no credentials" });
  }
  try {
    const user = await db.user.findUnique({ where: { id: u.userId } });
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
    const { passwordHash: _, ...rest } = user;

    db.update(users)
      .set({
        lastLoginAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(users.id, u.userId))
      .catch(console.error);

    await createSession({
      userId: user.id,
      role: user.role,
      email: user.email,
      country: user.country,
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
