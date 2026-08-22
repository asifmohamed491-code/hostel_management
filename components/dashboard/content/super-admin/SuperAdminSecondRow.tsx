// SuperAdminSecondRow.tsx
//
// Matches the reference screenshot's second row: Student Overview
// (donut), Hostel Occupancy (donut), Hostel Block Overview (progress
// bars — same pattern as ProgressOverview.tsx), Warden Overview (mini
// table — same pattern as RecentAttendanceTable.tsx). All four reuse
// the shared DashboardCard shell.
"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { DonutChart } from "@/components/dashboard/content/super-admin/DonutChart";
import { cn } from "@/lib/cn";
import {
  STUDENT_OVERVIEW,
  HOSTEL_OCCUPANCY,
  HOSTEL_BLOCKS,
  WARDEN_OVERVIEW,
} from "@/lib/super-admin-dashboard-mock";

function LegendDot({ color }: { color: string }) {
  return <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />;
}

function StudentOverviewCard() {
  return (
    <DashboardCard title="Student Overview" className="sa-dashboard-card sa-dashboard-card--violet flex h-full flex-col" bodyClassName="sa-chart-body flex flex-1 flex-col items-center px-4 pb-5 pt-3">
      <DonutChart
        segments={[
          { value: STUDENT_OVERVIEW.active, color: "#6E42F5" },
          { value: STUDENT_OVERVIEW.inactive, color: "#E3D8FB" },
        ]}
        centerValue={String(STUDENT_OVERVIEW.total)}
        centerLabel="Total Students"
      />
      <div className="donut-legend-row mt-4 flex items-center justify-center gap-5 text-[12.5px] font-semibold text-heading/70">
        <span className="flex items-center gap-1.5">
          <LegendDot color="#6E42F5" />
          Active: {STUDENT_OVERVIEW.active}
        </span>
        <span className="flex items-center gap-1.5">
          <LegendDot color="#E3D8FB" />
          Inactive: {STUDENT_OVERVIEW.inactive}
        </span>
      </div>
    </DashboardCard>
  );
}

function HostelOccupancyCard() {
  return (
    <DashboardCard title="Hostel Occupancy" className="sa-dashboard-card sa-dashboard-card--pearl flex h-full flex-col" bodyClassName="sa-chart-body flex flex-1 flex-col items-center px-4 pb-5 pt-3">
      <DonutChart
        segments={[
          { value: HOSTEL_OCCUPANCY.occupied, color: "#6E42F5" },
          { value: HOSTEL_OCCUPANCY.available, color: "#E3D8FB" },
        ]}
        centerValue={`${HOSTEL_OCCUPANCY.occupancyPct}%`}
        centerLabel="Occupancy"
      />
      <div className="donut-legend-row mt-4 flex flex-col items-start gap-1.5 text-[12.5px] font-semibold text-heading/70">
        <span className="flex items-center gap-1.5">
          <LegendDot color="#6E42F5" />
          Total Rooms: {HOSTEL_OCCUPANCY.totalRooms}
        </span>
        <span className="flex items-center gap-1.5">
          <LegendDot color="#6E42F5" />
          Occupied: {HOSTEL_OCCUPANCY.occupied}
        </span>
        <span className="flex items-center gap-1.5">
          <LegendDot color="#E3D8FB" />
          Available: {HOSTEL_OCCUPANCY.available}
        </span>
      </div>
    </DashboardCard>
  );
}

function HostelBlockOverviewCard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const bars = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".block-bar-fill", containerRef.current)
        : [];
      const rows = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".block-row", containerRef.current)
        : [];
      const scrollerEl = document.getElementById("dashboard-scroll-container") || undefined;

      if (prefersReducedMotion()) {
        gsap.set(rows, { opacity: 1, y: 0 });
        gsap.set(bars, { scaleX: 1 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: containerRef.current,
          scroller: scrollerEl,
          start: "top 85%",
          once: true,
        },
      });

      tl.fromTo(rows, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }).fromTo(
        bars,
        { scaleX: 0, transformOrigin: "0% 50%" },
        { scaleX: 1, duration: 0.8, stagger: 0.1, ease: "power3.inOut" },
        "-=0.3"
      );
    },
    { scope: containerRef }
  );

  return (
    <DashboardCard title="Hostel Block Overview" className="sa-dashboard-card sa-dashboard-card--lilac flex h-full flex-col" bodyClassName="flex flex-1 flex-col justify-center px-[19px] pb-4 pt-2">
      <div ref={containerRef} className="flex flex-col gap-4">
        {HOSTEL_BLOCKS.map((block) => (
          <div key={block.id} className="block-row">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[13px] font-semibold text-heading">{block.name}</p>
              <div className="text-right">
                <p className="text-[13px] font-bold text-heading">{block.pct}%</p>
                <p className="text-[11px] font-medium text-heading/45">
                  Rooms: {block.rooms} · {block.secondaryLabel}: {block.secondaryValue}
                </p>
              </div>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-heading/[0.07]">
              <div
                className="block-bar-fill h-full rounded-full bg-primary"
                style={{ width: `${block.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

const WARDEN_STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-600",
  Inactive: "bg-heading/[0.06] text-heading/45",
};

function WardenOverviewCard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rows = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".warden-row-item", containerRef.current)
        : [];
      const scrollerEl = document.getElementById("dashboard-scroll-container") || undefined;

      if (prefersReducedMotion()) {
        gsap.set(rows, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        rows,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: containerRef.current,
            scroller: scrollerEl,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <DashboardCard title="Warden Overview" className="sa-dashboard-card sa-dashboard-card--mist flex h-full flex-col" bodyClassName="flex flex-1 flex-col px-[19px] pb-4 pt-1">
      <p className="text-[12.5px] font-semibold text-heading/60">
        Total: {WARDEN_OVERVIEW.total} ({WARDEN_OVERVIEW.active} Active, {WARDEN_OVERVIEW.inactive} Inactive)
      </p>

      <div ref={containerRef} className="mt-3 flex flex-1 flex-col">
        <div className="grid grid-cols-[1.4fr_1fr_0.9fr] gap-2 border-b border-heading/[0.06] pb-2 text-[11px] font-semibold uppercase tracking-wide text-heading/35">
          <span>Recent</span>
          <span>Block</span>
          <span>Status</span>
        </div>
        <div className="flex flex-col divide-y divide-heading/[0.05]">
          {WARDEN_OVERVIEW.recent.map((row) => (
            <div key={row.id} className="warden-row-item grid grid-cols-[1.4fr_1fr_0.9fr] items-center gap-2 py-2.5">
              <span className="truncate text-[13px] font-semibold text-heading">{row.name}</span>
              <span className="truncate text-[12.5px] font-medium text-heading/55">{row.block}</span>
              <span
                className={cn(
                  "w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  WARDEN_STATUS_STYLES[row.status]
                )}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

export function SuperAdminSecondRow() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      <StudentOverviewCard />
      <HostelOccupancyCard />
      <HostelBlockOverviewCard />
      <WardenOverviewCard />
    </div>
  );
}
