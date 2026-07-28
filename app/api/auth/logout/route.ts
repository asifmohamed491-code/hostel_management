// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/jwt";
import { getAuthCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out." }, { status: 200 });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });

  return response;
}
