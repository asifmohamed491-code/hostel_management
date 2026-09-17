"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, Bell, X, Menu } from "lucide-react";
import { useMobileNav } from "@/components/dashboard/MobileNavContext";
import { ProfileMenu } from "@/components/dashboard/ProfileMenu";

const TODAY = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { toggle: toggleMobileNav } = useMobileNav();
  const router = useRouter();

  // Refs for outside-click detection
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch notifications once on mount
  useEffect(() => {
    let cancelled = false;
    fetch("/api/notifications", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { notifications?: NotificationItem[] } | null) => {
        if (!cancelled && data?.notifications) setNotifications(data.notifications);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
      await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notification.id }),
      }).catch(() => undefined);
    }
    setNotificationsOpen(false);
    if (notification.href) router.push(notification.href);
  };

  // Close popup when clicking/tapping outside both the bell and the panel.
  // Uses pointerdown so it fires before click, preventing any toggle race.
  useEffect(() => {
    if (!notificationsOpen) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      const insideBell = bellRef.current?.contains(target) ?? false;
      const insidePanel = panelRef.current?.contains(target) ?? false;
      if (!insideBell && !insidePanel) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, { capture: true });
    return () => document.removeEventListener("pointerdown", handlePointerDown, { capture: true });
  }, [notificationsOpen]);

  // Scroll state for the topbar backdrop
  useEffect(() => {
    const scrollContainer = document.getElementById("dashboard-scroll-container");
    if (!scrollContainer) return;
    const updateScrolledState = () => setIsScrolled(scrollContainer.scrollTop > 0);
    updateScrolledState();
    scrollContainer.addEventListener("scroll", updateScrolledState, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", updateScrolledState);
  }, []);

  // ─── Notification Panel ────────────────────────────────────────────
  // Rendered via createPortal into document.body so it escapes every
  // parent's CSS (including liquid-glass's `position: relative`) and
  // `fixed` positioning is always relative to the real viewport.
  //
  // Positioning strategy:
  //  • Mobile (< 768px): fixed, horizontally centered via left:50% + translateX(-50%).
  //    Width is calc(100vw - 32px) — 16px safe margin on each side.
  //  • Desktop (≥ 768px): fixed, right-anchored to the bell button's right edge.
  //    Top = bell bottom + 8px gap. We use `right` = viewport-width - bellRect.right.
  const NotificationPanel = notificationsOpen ? (
    <div
      ref={panelRef}
      // ── Mobile: centered in viewport ──────────────────────────────
      // ── Desktop (md:): right-anchored below the bell ──────────────
      // We achieve both with a single element using Tailwind's responsive
      // variants. At md+, we manually nudge left via inline style below.
      className="fixed z-[9999] top-[76px] rounded-2xl p-2 w-[calc(100vw-32px)] left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:w-[360px] md:top-[76px]"
      style={
        // On desktop, anchor the right edge of the panel to the right edge
        // of the bell button. We do this via inline style because we need
        // the bell's live position, which is only available at runtime.
        // On mobile the inline style is ignored — the Tailwind centering wins.
        bellRef.current && typeof window !== "undefined" && window.innerWidth >= 768
          ? {
              right:
                window.innerWidth -
                bellRef.current.getBoundingClientRect().right,
            }
          : undefined
      }
    >
      {/* The glass background is a child div so it doesn't inherit
          position:relative from liquid-glass (portal root is fixed). */}
      <div className="liquid-glass h-full w-full rounded-2xl p-2 shadow-glass-lg">
        <p className="px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-heading/45">
          Notifications
        </p>
        {notifications.length === 0 ? (
          <p className="px-3 py-4 text-[13px] font-medium text-heading/50">
            No notifications yet.
          </p>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => handleNotificationClick(notification)}
              className="flex w-full flex-col gap-1 rounded-xl px-3 py-2 text-left transition-colors hover:bg-primary/5"
            >
              <span className="flex items-center gap-2 text-[13px] font-bold text-heading">
                {!notification.read && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F0A420]" />
                )}
                {notification.title}
              </span>
              <span className="text-[12px] leading-relaxed text-heading/55">
                {notification.message}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <header className="sticky top-0 z-20 isolate flex h-16 w-full items-center justify-between gap-1.5 sm:gap-2 px-3.5 sm:px-4 sm:h-20 lg:px-8">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-0 border-b transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ${
          isScrolled
            ? "border-white/20 bg-white/10 shadow-[0_3px_12px_rgba(76,29,149,0.05)] backdrop-blur-[6px]"
            : "border-transparent bg-transparent shadow-none backdrop-blur-0"
        }`}
      />
      {/* Hamburger — mobile/tablet only (same breakpoint the Sidebar
          rail itself uses to hide), opens the existing Sidebar as a
          slide-in drawer. Not rendered at all visually at `lg` and up,
          so desktop is unaffected. */}
      <button
        type="button"
        onClick={toggleMobileNav}
        aria-label="Open navigation menu"
        className="relative z-10 liquid-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/40 transition-colors hover:bg-white/55 lg:hidden"
      >
        <Menu className="h-[18px] w-[18px] text-heading/70" />
      </button>

      {/* Mobile Search - Expanded Overlay */}
      {searchOpen ? (
        <div className="relative z-10 flex flex-1 items-center gap-2 pr-2 md:hidden">
          <div className="liquid-glass flex h-10 w-full items-center gap-2 rounded-full bg-white/40 px-3.5">
            <Search className="h-4 w-4 shrink-0 text-heading/40" />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className="w-full bg-transparent text-[13px] font-medium text-heading placeholder:text-heading/35 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/30 text-heading/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Search Bar */}
          <div className="relative z-10 liquid-glass hidden h-11 w-full max-w-[360px] items-center gap-2.5 rounded-full bg-white/40 px-4 md:flex">
            <Search className="h-4 w-4 shrink-0 text-heading/40" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent text-[13px] font-medium text-heading placeholder:text-heading/35 focus:outline-none"
            />
          </div>

          {/* Mobile Search Trigger Icon */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="relative z-10 liquid-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/40 transition-colors hover:bg-white/55 md:hidden"
          >
            <Search className="h-[18px] w-[18px] text-heading/70" />
          </button>

          <div className="relative z-10 flex-1 md:flex-none" />

          {/* Right Action Items */}
          <div className="relative z-10 flex items-center gap-2 sm:gap-3">
            {/* Date - Hidden on Mobile & Tablet */}
            <span className="hidden whitespace-nowrap text-[13px] font-semibold text-heading/80 lg:inline">
              {TODAY}
            </span>

            {/* Notifications */}
            <div className="relative">
              <button
                ref={bellRef}
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
                className="liquid-glass relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/40 transition-colors hover:bg-white/55"
              >
                <Bell className="h-[18px] w-[18px] text-heading/70" />
                {unreadCount > 0 && (
                  <span className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full border border-white bg-[#F0A420]" />
                )}
              </button>

              {/* Portal-rendered notification panel — see NotificationPanel above */}
              {typeof window !== "undefined" &&
                createPortal(NotificationPanel, document.body)}
            </div>

            {/* User Profile */}
            <ProfileMenu />
          </div>
        </>
      )}
    </header>
  );
}