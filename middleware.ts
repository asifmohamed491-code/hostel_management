// middleware.ts
// Phase 2 — role-based route protection. Reuses the Phase 1 JWT/cookie
// helpers (lib/jwt.ts) rather than re-implementing auth. Runs on the
// Node.js runtime since jsonwebtoken relies on Node's crypto module.
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import type { UserRole } from "@/models/User";

export const runtime = "nodejs";

const ROLE_HOME: Record<UserRole, string> = {
  super_admin: "/dashboard/super-admin",
  warden: "/dashboard/warden",
  student: "/dashboard/student",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const home = ROLE_HOME[payload.role];

  // The Create Student page is Warden-only.
  if (pathname === "/signup") {
    if (payload.role !== "warden") {
      return NextResponse.redirect(new URL(home, request.url));
    }
    return NextResponse.next();
  }

  // Bare "/dashboard" isn't any specific role's page — send the user to
  // their own dashboard.
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Every other /dashboard/* route must match the user's own role home;
  // opening another role's dashboard redirects back to their own.
  if (!pathname.startsWith(home)) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/signup"],
};