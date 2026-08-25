// ProfileMenu.tsx
//
// The navbar's profile/account dropdown (desktop + mobile — same
// trigger button the Topbar already rendered, now wired to open a
// menu instead of doing nothing). Renders:
//   - a dynamic header (avatar/initials, name, role) from the existing
//     current-user hook — never hardcoded, works for any role
//   - "Account Details", routed per-role via ACCOUNT_DETAILS_ROUTE
//   - "Settings" — visible only, no page/logic yet (out of scope)
//   - "Logout" — reuses the existing useLogout hook (same one the
//     Sidebar/MobileBottomNav already call), so there is exactly one
//     logout implementation in the app
//
// Positioning: the panel is `absolute right-0` under the trigger, so it
// always hangs inward from the trigger's right edge instead of
// overflowing off-screen — the exact case the Topbar's profile pill is
// in, since it already sits at the far right of the header. A
// `max-w-[calc(100vw-2rem)]` safety net additionally caps its width on
// very narrow viewports.
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLogout } from "@/hooks/useLogout";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import { ROLE_LABELS, ACCOUNT_DETAILS_ROUTE, getInitials } from "@/lib/user-display";

export function ProfileMenu() {
  const { user } = useCurrentUser();
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape — standard dropdown behavior,
  // only attached while the menu is actually open.
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const initials = user ? getInitials(user.fullName) : "";
  const roleLabel = user ? ROLE_LABELS[user.role] : "";
  const accountHref = user ? ACCOUNT_DETAILS_ROUTE[user.role] : "/dashboard";

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Trigger — same markup/classes the Topbar profile pill already
          had, just made interactive. */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open account menu"
        className="flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-1.5 transition-colors hover:bg-white/30 sm:pr-2"
      >
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-heading text-[13px] font-semibold text-white"
        >
          {initials}
        </span>
        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-[10px] font-medium text-heading/45">{roleLabel}</span>
          <span className="max-w-[140px] truncate text-[13px] font-semibold text-heading">
            {user ? user.fullName : ""}
          </span>
        </span>
        <ChevronDown
          className={`hidden h-3.5 w-3.5 shrink-0 text-heading/40 transition-transform duration-150 sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-glass-lg backdrop-blur-xl"
        >
          {/* Profile header — dynamic avatar/name/role */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <InitialsAvatar initials={initials} size={40} />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-heading">
                {user ? user.fullName : ""}
              </p>
              <p className="truncate text-[12px] font-medium text-heading/50">{roleLabel}</p>
            </div>
          </div>

          <div className="border-t border-heading/[0.08]" />

          {/* Menu */}
          <div className="p-1.5">
            <Link
              href={accountHref}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex min-h-[42px] items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-heading/75 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <User className="h-[17px] w-[17px] shrink-0" />
              Account Details
            </Link>
            {/* Settings — UI only for now, intentionally no route/logic. */}
            <button
              type="button"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex min-h-[42px] w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-heading/75 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Settings className="h-[17px] w-[17px] shrink-0" />
              Settings
            </button>
          </div>

          <div className="border-t border-heading/[0.08]" />

          <div className="p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                void logout();
              }}
              className="group flex min-h-[42px] w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-heading/70 transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut className="h-[17px] w-[17px] shrink-0" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
