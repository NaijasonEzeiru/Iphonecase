import { UserWithRelations } from "@/db/schema";

export async function getCurrentUser(): Promise<UserWithRelations | null> {
  const res = await fetch("/api/me", { credentials: "include" });
  if (!res.ok) return null; // not logged in
  const data = await res.json();
  return data?.user || null;
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
