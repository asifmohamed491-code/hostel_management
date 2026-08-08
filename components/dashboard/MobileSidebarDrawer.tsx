"use client";

// MobileSidebarDrawer.tsx
// The "existing Sidebar as a slide-in drawer" on mobile. It does not
// reimplement navigation — it renders the exact same SidebarNavContent
// (Sidebar.tsx) the desktop rail uses, just inside an overlay panel
// instead of a fixed rail. Only visible below `lg` (matches the
// existing Sidebar's own `hidden lg:flex` desktop breakpoint), and only
// takes effect when opened via the Topbar's hamburger button.
import { cn } from "@/lib/cn";
import { SidebarNavContent } from "@/components/dashboard/Sidebar";
import { useMobileNav } from "@/components/dashboard/MobileNavContext";

export function MobileSidebarDrawer() {
  const { isOpen, close } = useMobileNav();

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop — clicking outside the drawer closes it */}
      <div
        onClick={close}
        aria-hidden
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Drawer panel — same liquid-glass treatment as the desktop rail */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "liquid-glass absolute left-0 top-0 flex h-full w-[260px] max-w-[80vw] flex-col justify-between overflow-y-auto overscroll-contain no-scrollbar",
          "border-r border-white/40 bg-white/90 py-2 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backdropFilter: "blur(28px) saturate(180%)" }}
      >
        {/* Closes the drawer after any nav link (including sub-items and
            Logout) is clicked. */}
        <SidebarNavContent onNavigate={close} />
      </aside>
    </div>
  );
}
