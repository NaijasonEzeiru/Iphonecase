import { NextResponse } from "next/server";

export const POST = async () => {
  try {
    const response = NextResponse.json({
      message: "Logout successful",
    });
    // clearSession();
    response.cookies.set({
      name: "session",
      value: "",
      httpOnly: true,
      path: "/",
      maxAge: -1,
    });
    return response;
  } catch {
    return new NextResponse(
      JSON.stringify({
        error: {
          message: "Logout failed",
        },
      }),
      { status: 500 },
    );
  }
};
