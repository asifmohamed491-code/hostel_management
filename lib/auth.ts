// lib/auth.ts
import type { IUser } from "@/models/User";
import { AUTH_COOKIE_MAX_AGE_SECONDS } from "@/lib/jwt";

interface CookieOptions {
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
  path: string;
  maxAge: number;
}

/** Fields that are safe to return to the client — never the password. */
export interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: IUser["role"];
  department?: string;
  year?: string;
  roomNumber?: string;
}

export function toSafeUser(user: IUser): SafeUser {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    department: user.department,
    year: user.year,
    roomNumber: user.roomNumber,
  };
}

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  };
}
