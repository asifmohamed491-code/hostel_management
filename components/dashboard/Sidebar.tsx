"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { LOGOUT_ITEM, type NavItem } from "@/lib/dashboard-nav";
import { useRoleNavSections } from "@/hooks/useRoleNavSections";

function NavRow({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(active && !!item.children);
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;

  const rowContent = (
    <>
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors duration-150",
          active ? "text-[#6E42F5]" : "text-heading/60 group-hover:text-[#6E42F5]"
        )}
      />
      <span
        className={cn(
          "flex-1 truncate text-[13px] transition-colors duration-150",
          active
            ? "font-semibold text-[#6E42F5]"
            : "font-medium text-heading/70 group-hover:text-[#6E42F5]"
        )}
      >
        {item.label}
      </span>
      {hasChildren && (
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-all duration-200",
            active ? "text-[#6E42F5]" : "text-heading/40 group-hover:text-[#6E42F5]",
            open && "rotate-180"
          )}
        />
      )}
    </>
  );

  const rowClass = cn(
    "group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
    active
      ? "bg-[#E3D8FB]" // Image-ல் இருப்பது போன்ற சாஃப்ட் பர்பிள் Selected State
      : "hover:bg-[#E3D8FB]/35" // Distinct, lighter hover background for differentiation
  );

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={rowClass}
          aria-expanded={open}
        >
          {rowContent}
        </button>
        <div
          className={cn(
            "grid overflow-hidden transition-all duration-200 ease-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0">
            <div className="ml-[26px] mt-1 flex flex-col gap-0.5 border-l border-[#6E42F5]/20 pl-4">
              {item.children!.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onNavigate}
                  className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-heading/60 transition-colors hover:bg-[#E3D8FB]/30 hover:text-[#6E42F5]"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={item.href} onClick={onNavigate} className={rowClass}>
      {rowContent}
    </Link>
  );
}

/**
 * The Sidebar's actual nav content — logo, role-based nav sections, and
 * the pinned Logout row. Rendered by both the fixed desktop rail
 * (`Sidebar`, below) and the mobile slide-in drawer
 * (`MobileSidebarDrawer.tsx`), so there is exactly one implementation of
 * "what the sidebar shows" for every role, reused rather than
 * duplicated. `onNavigate` is only passed by the mobile drawer, to close
 * itself after a link is clicked — the desktop rail passes nothing and
 * behaves exactly as it did before this was extracted.
 */
export function SidebarNavContent({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();

  // Same Sidebar nav for every role — only the nav items change, driven
  // entirely by lib/dashboard-nav.ts.
  const navSections = useRoleNavSections();

  const isActive = (item: NavItem) =>
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
    !!item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href));

  return (
    <>
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 pb-2 pt-2">
          <Image
            src="/assets/logo/oasys-mark.svg"
            alt="OASYS"
            width={180}
            height={180}
            priority
          />
        </div>

        {/* Nav */}
        <nav className="px-3.5 pt-1">
          {navSections.map((section, idx) => (
            <div key={section.label ?? idx} className={idx === 0 ? "mb-1" : "mt-4"}>
              {section.label && (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-heading/35">
                  {section.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavRow
                    key={item.href}
                    item={item}
                    active={isActive(item)}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Logout — pinned to bottom */}
      <div className="border-t border-white/40 px-3.5 py-3">
        <Link
          href={LOGOUT_ITEM.href}
          onClick={onNavigate}
          className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-red-500/10"
        >
          <LOGOUT_ITEM.icon className="h-[18px] w-[18px] shrink-0 text-heading/50 group-hover:text-red-500" />
          <span className="text-[13px] font-medium text-heading/70 group-hover:text-red-500">
            {LOGOUT_ITEM.label}
          </span>
        </Link>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside
      className={cn(
        "liquid-glass sticky top-0 hidden h-screen max-h-screen w-[260px] shrink-0 flex-col justify-between rounded-none",
        // Sidebar handles its own vertical overflow independently of
        // the main content: `overflow-y-auto` lets it scroll when
        // expanded submenus make it taller than the viewport, and
        // `overscroll-contain` stops that scroll from chaining to the
        // main content once the sidebar hits its top/bottom edge (so
        // hovering the sidebar only ever scrolls the sidebar). Visual
        // scrollbar is hidden via the same `no-scrollbar` utility the
        // rest of the dashboard already uses.
        "overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar",
        "border-r border-white/40 bg-white/25 py-2 lg:flex" // Ungal Original Glass Background Retention
      )}
      style={{ backdropFilter: "blur(28px) saturate(180%)" }}
    >
      <SidebarNavContent />
    </aside>
  );
}
