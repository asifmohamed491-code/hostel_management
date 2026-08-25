// lib/user-display.ts
//
// Small presentation helpers for the authenticated user, shared across
// the Topbar profile pill, the ProfileMenu dropdown, and the Account
// Details page. Previously `ROLE_LABELS` and `getInitials` were defined
// inline inside Topbar.tsx — pulled out here so the dropdown and the
// Account Details page can reuse the exact same "name -> initials" and
// "role -> label" logic instead of re-implementing it.
import type { IUser } from "@/models/User";

// Same UserRole values as models/User.ts / lib/dashboard-nav.ts, mapped
// to the display label shown in the profile pill and dropdown header.
export const ROLE_LABELS: Record<IUser["role"], string> = {
  super_admin: "Super Admin",
  warden: "Warden",
  student: "Student",
};

// "Mohamed Asif" -> "MA". Falls back to the first two letters of a
// single-word name so it never renders empty.
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? first;
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

/**
 * Where the navbar's "Account Details" dropdown item sends each role.
 * Mirrors the `/dashboard/<role>/...` home-prefix convention already
 * enforced by middleware.ts. Only the Student route has a page behind
 * it right now (components/dashboard/content/student/StudentAccountDetails.tsx),
 * per this task's scope — Warden/Super Admin get a reserved route so
 * wiring their own Account Details pages later is a drop-in, not a
 * routing change.
 */
export const ACCOUNT_DETAILS_ROUTE: Record<IUser["role"], string> = {
  student: "/dashboard/student/account",
  warden: "/dashboard/warden/account",
  super_admin: "/dashboard/super-admin/account",
};
