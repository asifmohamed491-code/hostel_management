// Topbar.tsx
"use client";

import { Search, Bell, ChevronDown } from "lucide-react";

const TODAY = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-20 w-full items-center gap-4 px-6 lg:px-8">
      {/* Search */}
      <div className="liquid-glass flex h-11 w-full max-w-[360px] items-center gap-2.5 rounded-full bg-white/40 px-4">
        <Search className="h-4 w-4 shrink-0 text-heading/40" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent text-[13px] font-medium text-heading placeholder:text-heading/35 focus:outline-none"
        />
      </div>

      <div className="flex-1" />

      {/* Date */}
      <span className="hidden whitespace-nowrap text-[13px] font-semibold text-heading/80 md:inline">
        {TODAY}
      </span>

      {/* Hostel block selector */}
      <button
        type="button"
        className="liquid-glass flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-white/40 px-4 text-[12.5px] font-semibold text-heading/75 transition-colors hover:bg-white/55"
      >
        Hostel Block: Block A
        <ChevronDown className="h-3.5 w-3.5 text-heading/45" />
      </button>

      {/* Notifications */}
      <button
        type="button"
        aria-label="Notifications"
        className="liquid-glass relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/40 transition-colors hover:bg-white/55"
      >
        <Bell className="h-[18px] w-[18px] text-heading/70" />
        <span className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full border border-white bg-[#F0A420]" />
      </button>

      {/* User */}
      <button
        type="button"
        className="flex shrink-0 items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white/30"
      >
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-heading text-[13px] font-semibold text-white"
        >
          SJ
        </span>
        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-[10px] font-medium text-heading/45">Warden</span>
          <span className="text-[13px] font-semibold text-heading">Sarah Jones</span>
        </span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-heading/40 sm:block" />
      </button>
    </header>
  );
}
