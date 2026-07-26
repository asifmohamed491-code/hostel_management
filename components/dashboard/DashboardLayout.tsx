// DashboardLayout.tsx
import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Layer 0 — fixed background, covers the full viewport, never
          scrolls, and always sits behind every dashboard component.
          Uses the uploaded dash-bg.svg (same gradient tokens as the
          rest of the liquid-glass design system). */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 h-screen w-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/assets/dashboard/dash-bg.svg)" }}
      />

      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar />

        <div className="flex min-h-screen w-full flex-1 flex-col">
          <Topbar />
          <main className="no-scrollbar flex-1 overflow-y-auto px-6 pb-8 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
