"use client";

// FullScreenPortal.tsx
// Renders its children as a full-screen layer on top of the dashboard
// chrome (Sidebar, Topbar, bottom nav). Used by the Edit Warden route so
// it can be a REAL page under /dashboard/super-admin/wardens/[id]/edit —
// protected by middleware.ts and needing no next.config.ts rewrite — while
// still looking exactly like the full-screen Create Warden page.
//
// It portals to <body> because DashboardLayout's content column creates
// its own stacking context (z-10), which would otherwise keep a `fixed`
// layer underneath the Sidebar (z-30). `useSyncExternalStore` gives
// `false` on the server / during hydration and `true` on the client, so
// there is no hydration mismatch and no extra frame on client navigation.
import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

export function FullScreenPortal({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] overflow-hidden bg-lavender">
      {children}
    </div>,
    document.body
  );
}
