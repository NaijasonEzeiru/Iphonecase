import { NextRequest, NextResponse } from "next/server";
import { resendVerificationEmail } from "@/apiFunctions/resendCode";

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json(
      { error: { message: "User ID is required" } },
      { status: 400 },
    );
  }
  await resendVerificationEmail(email);
}
