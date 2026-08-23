"use client";

// MobileBottomNav.tsx
// Fixed bottom nav shown only below the `md` breakpoint (<768px). It
// does not introduce a new set of nav items — it flattens the exact
// same role-based sections the Sidebar renders (via the shared
// useRoleNavSections hook) into one horizontally scrollable strip, plus
// Logout at the end. Every top-level item is kept (nothing removed,
// nothing collapsed into a "More" menu); items with children link to
// their own parent href here — the full nested list is still reachable
// through the hamburger drawer.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { LOGOUT_ITEM, type NavItem } from "@/lib/dashboard-nav";
import { useRoleNavSections } from "@/hooks/useRoleNavSections";
import { useLogout } from "@/hooks/useLogout";

export function MobileBottomNav() {
  const navSections = useRoleNavSections();
  const pathname = usePathname();
  const logout = useLogout();

  const items: NavItem[] = [
    ...navSections.flatMap((section) => section.items),
    LOGOUT_ITEM,
  ];

  const isActive = (item: NavItem) =>
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
    !!item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href));

  return (
    <nav
      aria-label="Mobile navigation"
      className="liquid-glass fixed inset-x-0 bottom-0 z-40 flex h-16 items-center gap-1 overflow-x-auto no-scrollbar border-t border-white/40 bg-white/80 px-2 md:hidden"
      style={{ backdropFilter: "blur(28px) saturate(180%)" }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        const isLogout = item.href === LOGOUT_ITEM.href;

        const itemClassName = cn(
          "flex h-full shrink-0 flex-col items-center justify-center gap-1 px-3.5 text-center transition-colors",
          isLogout
            ? "text-heading/50 hover:text-red-500"
            : active
              ? "text-[#6E42F5]"
              : "text-heading/60"
        );

        if (isLogout) {
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => void logout()}
              className={itemClassName}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="whitespace-nowrap text-[10px] font-medium">{item.label}</span>
            </button>
          );
        }

        return (
          <Link key={item.href} href={item.href} className={itemClassName}>
            <Icon className="h-5 w-5 shrink-0" />
            <span className="whitespace-nowrap text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}