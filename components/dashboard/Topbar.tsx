"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown, X } from "lucide-react";

const TODAY = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between gap-2 px-4 sm:h-20 lg:px-8">
      {/* Mobile Search - Expanded Overlay */}
      {searchOpen ? (
        <div className="flex flex-1 items-center gap-2 pr-2 md:hidden">
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
          <div className="liquid-glass hidden h-11 w-full max-w-[360px] items-center gap-2.5 rounded-full bg-white/40 px-4 md:flex">
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
            className="liquid-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/40 transition-colors hover:bg-white/55 md:hidden"
          >
            <Search className="h-[18px] w-[18px] text-heading/70" />
          </button>

          <div className="flex-1 md:flex-none" />

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Date - Hidden on Mobile & Tablet */}
            <span className="hidden whitespace-nowrap text-[13px] font-semibold text-heading/80 lg:inline">
              {TODAY}
            </span>

            {/* Hostel block selector - Hidden on Small Mobile Screens */}
            <button
              type="button"
              className="liquid-glass hidden h-10 items-center gap-2 whitespace-nowrap rounded-full bg-white/40 px-3.5 text-[12px] font-semibold text-heading/75 transition-colors hover:bg-white/55 sm:flex sm:px-4 sm:text-[12.5px]"
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

            {/* User Profile */}
            <button
              type="button"
              className="flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-1.5 transition-colors hover:bg-white/30 sm:pr-2"
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
          </div>
        </>
      )}
    </header>
  );
}