// Sidebar.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_SECTIONS, LOGOUT_ITEM, type NavItem } from "@/lib/dashboard-nav";

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const [open, setOpen] = useState(active && !!item.children);
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;

  const rowContent = (
    <>
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active ? "text-primary" : "text-heading/50 group-hover:text-primary/80"
        )}
      />
      <span
        className={cn(
          "flex-1 truncate text-[13px] transition-colors",
          active ? "font-semibold text-heading" : "font-medium text-heading/70 group-hover:text-heading"
        )}
      >
        {item.label}
      </span>
      {hasChildren && (
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-heading/40 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      )}
    </>
  );

  const rowClass = cn(
    "group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
    active
      ? "bg-white/70 shadow-[0_2px_10px_rgba(110,66,245,0.12)]"
      : "hover:bg-white/35"
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
            <div className="ml-[26px] mt-1 flex flex-col gap-0.5 border-l border-heading/10 pl-4">
              {item.children!.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-heading/60 transition-colors hover:bg-white/40 hover:text-heading"
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
    <Link href={item.href} className={rowClass}>
      {rowContent}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
    !!item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href));

  return (
    <aside
      className={cn(
        "liquid-glass no-scrollbar sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col overflow-y-auto rounded-none",
        "border-r border-white/40 bg-white/25 lg:flex"
      )}
      style={{ backdropFilter: "blur(28px) saturate(180%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 pb-4 pt-6">
        <Image
          src="/assets/logo/oasys-mark.svg"
          alt="OASYS"
          width={34}
          height={34}
          priority
        />
        <div className="flex flex-col leading-none">
          <span className="text-lg font-extrabold tracking-tight">
            <span className="text-[#F0A420]">O</span>
            <span className="bg-gradient-to-r from-primary to-heading bg-clip-text text-transparent">
              ASYS
            </span>
          </span>
          <span className="mt-0.5 text-[8.5px] font-semibold uppercase tracking-[0.12em] text-heading/45">
            Institute of Technology
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3.5 pb-3">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.label ?? idx} className={idx === 0 ? "mb-1" : "mt-5"}>
            {section.label && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-heading/35">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavRow key={item.href} item={item} active={isActive(item)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout — pinned to bottom */}
      <div className="border-t border-white/40 px-3.5 py-4">
        <Link
          href={LOGOUT_ITEM.href}
          className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/35"
        >
          <LOGOUT_ITEM.icon className="h-[18px] w-[18px] shrink-0 text-heading/50 group-hover:text-red-500" />
          <span className="text-[13px] font-medium text-heading/70 group-hover:text-red-500">
            {LOGOUT_ITEM.label}
          </span>
        </Link>
      </div>
    </aside>
  );
}
