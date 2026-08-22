"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import { cn } from "@/lib/cn";
import { ATTENDANCE_TABLE } from "@/lib/dashboard-mock";

const STATUS_STYLES: Record<string, string> = {
  Present: "bg-emerald-500/10 text-emerald-600",
  Late: "bg-amber-500/10 text-amber-600",
  Absent: "bg-rose-500/10 text-rose-500",
};

export function RecentAttendanceTable() {
  const tableRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rows = tableRef.current
        ? gsap.utils.toArray<HTMLElement>(".table-row-item", tableRef.current)
        : [];
      const scrollerEl =
        document.getElementById("dashboard-scroll-container") || undefined;

      if (prefersReducedMotion()) {
        gsap.set(rows, { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: tableRef.current,
          scroller: scrollerEl,
          start: "top 85%",
          once: true,
        },
      });

      // Step-by-Step One-by-One Row GSAP Sequence
      tl.fromTo(
        rows,
        {
          opacity: 0,
          y: 15,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
        }
      );
    },
    { scope: tableRef }
  );

  return (
    <DashboardCard
      title="Recent Attendance Table"
      className="sa-dashboard-card sa-dashboard-card--pearl flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col px-[19px] pb-4 pt-3"
    >
      {/* Mobile-ல Table ஒடுங்காமல் இருக்க 'overflow-x-auto' சேர்க்கப்பட்டுள்ளது */}
      <div ref={tableRef} className="flex flex-1 flex-col overflow-x-auto">
        <div className="min-w-[600px] flex flex-1 flex-col">
          {/* Header */}
          <div className="grid grid-cols-[24px_1.6fr_0.9fr_1fr_1fr_28px] items-center gap-3 border-b border-heading/[0.06] pb-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-heading/35">
            <input type="checkbox" className="h-3.5 w-3.5 rounded accent-primary cursor-pointer" aria-label="Select all" />
            <span>Student</span>
            <span>Status</span>
            <span>Date</span>
            <span>Last Updated</span>
            <span />
          </div>

          {/* Rows */}
          <div className="flex flex-1 flex-col justify-center divide-y divide-heading/[0.05]">
            {ATTENDANCE_TABLE.map((row) => (
              <div
                key={row.id}
                className="table-row-item grid grid-cols-[24px_1.6fr_0.9fr_1fr_1fr_28px] items-center gap-3 py-3"
              >
                <input type="checkbox" className="h-3.5 w-3.5 rounded accent-primary cursor-pointer" aria-label={`Select ${row.name}`} />
                <div className="flex min-w-0 items-center gap-2.5">
                  <InitialsAvatar initials={row.initials} size={30} />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-heading">{row.name}</p>
                    <p className="truncate text-[11px] font-medium text-heading/45">{row.room}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    STATUS_STYLES[row.status]
                  )}
                >
                  {row.status}
                </span>
                <span className="text-[12px] font-medium text-heading/55 whitespace-nowrap">{row.date}</span>
                <span className="text-[12px] font-medium text-heading/55 whitespace-nowrap">{row.lastUpdated}</span>
                <button
                  type="button"
                  aria-label={`More actions for ${row.name}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-heading/40 transition-colors hover:bg-heading/[0.06] hover:text-heading/70"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="4.5" r="1.6" fill="currentColor" />
                    <circle cx="10" cy="10" r="1.6" fill="currentColor" />
                    <circle cx="10" cy="15.5" r="1.6" fill="currentColor" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}