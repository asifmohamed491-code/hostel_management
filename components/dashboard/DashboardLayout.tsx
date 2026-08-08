// DashboardLayout.tsx
import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { MobileNavProvider } from "@/components/dashboard/MobileNavContext";
import { MobileSidebarDrawer } from "@/components/dashboard/MobileSidebarDrawer";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <MobileNavProvider>
      <div className="relative h-screen w-full overflow-hidden">
        {/* Layer 0 — fixed background, covers the full viewport, never
            scrolls, and always sits behind every dashboard component.
            Uses the uploaded dash-bg.svg (same gradient tokens as the
            rest of the liquid-glass design system). */}
        <div
          aria-hidden
          className="fixed inset-0 -z-10 h-screen w-screen bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/assets/dashboard/dash-bg.svg)" }}
        />

        <div className="relative z-10 flex h-full w-full">
          <Sidebar />

          <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
            <Topbar />
            {/* Extra bottom clearance below `md` only, so content isn't
                hidden behind the fixed MobileBottomNav — `md:pb-8`
                reproduces the exact previous padding at every breakpoint
                `md` and up, so desktop is pixel-for-pixel unchanged.
                `overscroll-contain` keeps this the ONLY scroll container
                on the page — the outer wrapper above is now a strict
                `h-screen overflow-hidden`, so there's no page-level
                scroll left to double up with this one, and the Sidebar
                (which scrolls independently, see Sidebar.tsx) can never
                be nudged by scrolling here. */}
            <main className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-6 pb-24 md:pb-8 lg:px-8">
              {children}
            </main>
          </div>
        </div>

        {/* Mobile only (<lg): slide-in drawer, reusing the same Sidebar
            nav content as the desktop rail. */}
        <MobileSidebarDrawer />
        {/* Mobile only (<md): fixed, horizontally scrollable bottom nav
            with every existing sidebar item. */}
        <MobileBottomNav />
      </div>
    </MobileNavProvider>
  );
}
