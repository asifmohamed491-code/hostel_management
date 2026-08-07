// hooks/useCurrentUser.ts
// Thin client wrapper around the existing /api/auth/me endpoint
// (app/api/auth/me/route.ts). Reused anywhere the client needs to know
// who's logged in — currently the Sidebar, for role-based nav — without
// touching auth, JWT, or middleware.
"use client";

import { useEffect, useState } from "react";
import type { SafeUser } from "@/lib/auth";

interface UseCurrentUserResult {
  user: SafeUser | null;
  loading: boolean;
}

export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const data: { user: SafeUser } = await res.json();
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
