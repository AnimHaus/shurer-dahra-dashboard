import { jwtVerify } from "jose";

export const AUTH_COOKIE = "sd_auth_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is not set");
  return new TextEncoder().encode(secret);
}

/** Verify a JWT token issued by the backend. Works in Node.js and Edge runtimes. */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}
