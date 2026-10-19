// lib/require-super-admin.ts
// Server-side guard for the hostel block / room APIs. Uses the existing JWT
// cookie helper (lib/auth.ts) — no new auth mechanism. Returns an error
// response to send, or null when the caller is an authenticated Super Admin.
import { NextRequest, NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/auth";

export function requireSuperAdmin(request: NextRequest): NextResponse | null {
  const payload = getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }
  if (payload.role !== "super_admin") {
    return NextResponse.json(
      { message: "Only a Super Admin can manage hostel blocks and rooms." },
      { status: 403 }
    );
  }
  return null;
}
