// lib/jwt.ts
import jwt from "jsonwebtoken";
import type { UserRole } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable. Add it to your .env file.");
}

export const AUTH_COOKIE_NAME = "oasys_token";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: AUTH_COOKIE_MAX_AGE_SECONDS,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
  } catch {
    return null;
  }
}
