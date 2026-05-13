import { User, UserWithRelations } from "@/db/schema";
import z from "zod";
import { loginSchema, registerSchema } from "../zodSchema";

export async function getCurrentUser(): Promise<UserWithRelations | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) return null; // not logged in
  const data = await res.json();
  return data?.user || null;
}

export async function loginUser({
  username,
  password,
}: z.infer<typeof loginSchema>): Promise<{
  messsage: string;
  data: User;
}> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.log({ errorData });
    throw (
      errorData || {
        message: "Login failed",
      }
    );
  }
  const response = await res.json();
  return response;
}

export async function registerUser(
  newuser: z.infer<typeof registerSchema>,
): Promise<{
  user: UserWithRelations;
  messsage: string;
}> {
  console.log({ newuser });
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newuser),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.log({ errorData });
    throw (
      errorData || {
        message: "Registration failed",
      }
    );
  }
  const response = await res.json();
  console.log({ response });
  return {
    user: response.data.user,
    messsage: response.message,
  };
}

export async function logoutUser() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.log({ errorData });
    throw (
      errorData || {
        message: "logout failed",
      }
    );
  }
  const response = await res.json();
  if (res.ok) {
    return response;
  }
}

export async function verifyCode({
  email,
  code,
}: {
  email: string;
  code: string;
}): Promise<{ data: User; message: string; code: string }> {
  const res = await fetch("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
    headers: { "Content-Type": "application/json" },
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response?.error || "something went wrong");
  return response;
}
