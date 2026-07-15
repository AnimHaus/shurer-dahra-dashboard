"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, COOKIE_MAX_AGE } from "@/lib/auth";

/**
 * Called by the client after it has already validated the token with the backend.
 * Only responsibility: write the httpOnly cookie and redirect.
 */
export async function setTokenAction(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/login");
}

export async function getAuthStatus(): Promise<boolean> {
  const { verifyToken } = await import("@/lib/auth");
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value ?? "";
  return verifyToken(token);
}
