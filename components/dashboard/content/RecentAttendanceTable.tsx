"use client";

import { useRef } from "react";
import { Users } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import { cn } from "@/lib/cn";
import { useWardenAttendanceStats, type AttendanceRow } from "@/hooks/useWardenAttendanceStats";

const STATUS_STYLES: Record<string, string> = {
  Present: "bg-emerald-500/10 text-emerald-600",
  Late: "bg-amber-500/10 text-amber-600",
  Absent: "bg-rose-500/10 text-rose-500",
};

export function RecentAttendanceTable() {
  const tableRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const { stats } = useWardenAttendanceStats();

  // Deduplicate by unique database attendance record ID
  const seenIds = new Set<string>();
  const rows: AttendanceRow[] = [];
  for (const row of stats?.recentAttendanceTable || []) {
    if (!seenIds.has(row.id)) {
      seenIds.add(row.id);
      rows.push(row);
    }
  }

  useGSAP(
    () => {
      const rowElements = tableRef.current
        ? gsap.utils.toArray<HTMLElement>(".table-row-item", tableRef.current)
        : [];
      const scrollerEl =
        document.getElementById("dashboard-scroll-container") || undefined;

      if (!rowElements.length) return;

      if (prefersReducedMotion() || hasAnimatedRef.current) {
        gsap.set(rowElements, { opacity: 1, y: 0 });
        hasAnimatedRef.current = true;
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
        onComplete: () => {
          hasAnimatedRef.current = true;
        },
      });

      // Step-by-Step One-by-One Row GSAP Sequence (Runs once on mount)
      tl.fromTo(
        rowElements,
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
    { scope: tableRef, dependencies: [rows.length] }
  );

  return (
    <DashboardCard
      title="Recent Attendance Table"
      className="sa-dashboard-card sa-dashboard-card--pearl flex h-full flex-col overflow-hidden"
      bodyClassName="flex flex-1 flex-col px-[19px] pb-3.5 pt-3 overflow-hidden"
    >
      {/* Outer wrapper: only handles horizontal scroll on mobile, strictly prevents vertical scroll */}
      <div ref={tableRef} className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden">
        <div className="min-w-[600px] flex flex-1 flex-col overflow-hidden">
          {/* Header - Fixed & Pinned at the top */}
          <div className="grid grid-cols-[24px_1.6fr_0.9fr_1fr_1fr_28px] items-center gap-3 border-b border-heading/[0.06] pb-2 text-[11.5px] font-semibold uppercase tracking-wide text-heading/35 shrink-0">
            <input type="checkbox" className="h-3.5 w-3.5 rounded accent-primary cursor-pointer" aria-label="Select all" />
            <span>Student</span>
            <span>Status</span>
            <span>Date</span>
            <span>Last Updated</span>
            <span />
          </div>

          {/* Only Table Body Scrolls: exactly 3 rows visible, thin lavender scrollbar */}
          {rows.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center text-slate-400">
              <Users className="h-7 w-7 stroke-1 text-slate-300 mb-1" />
              <p className="text-xs font-semibold text-slate-500">No attendance records found</p>
              <p className="text-[11px] text-slate-400">Recorded attendance will be listed here</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-heading/[0.05] max-h-[148px] overflow-y-auto oasys-scrollbar pr-1.5">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="table-row-item grid grid-cols-[24px_1.6fr_0.9fr_1fr_1fr_28px] items-center gap-3 py-2.5 shrink-0"
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
                      STATUS_STYLES[row.status] || "bg-emerald-500/10 text-emerald-600"
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
          )}
        </div>
      </div>
    </DashboardCard>
  );
}