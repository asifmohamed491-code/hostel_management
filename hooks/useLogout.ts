// hooks/useLogout.ts
// Shared logout handler for the Sidebar (desktop rail + mobile drawer,
// via SidebarNavContent) and MobileBottomNav. Both previously rendered
// Logout as a plain `<Link href="/login">`, which only navigated to the
// login page — it never called the existing /api/auth/logout route, so
// the httpOnly `oasys_token` cookie was never cleared. The session
// stayed valid, and manually re-opening a dashboard URL (or pressing
// back) logged the user straight back in. This calls the existing
// logout API first, then navigates.
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  return useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }, [router]);
}