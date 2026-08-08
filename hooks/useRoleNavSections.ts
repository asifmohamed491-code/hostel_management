"use client";

// useRoleNavSections.ts
// Single place that resolves "which nav sections for the current user's
// role" (lib/dashboard-nav.ts -> ROLE_NAV_SECTIONS), so every nav
// surface — the desktop Sidebar rail, the mobile slide-in drawer, and
// the mobile bottom nav — reads from the exact same role-based data with
// no duplicated resolution logic.
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ROLE_NAV_SECTIONS, NAV_SECTIONS, type NavSection } from "@/lib/dashboard-nav";

export function useRoleNavSections(): NavSection[] {
  const { user } = useCurrentUser();
  // Falls back to the existing Warden nav (today's default) until the
  // current user loads, so nothing shifts or flashes for the common case
  // — same behavior the Sidebar already had.
  return user ? ROLE_NAV_SECTIONS[user.role] : NAV_SECTIONS;
}
