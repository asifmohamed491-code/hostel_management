// SuperAdminThirdRow.tsx
//
// Matches the reference screenshot's third row: Attendance Analytics
// (3-series line chart, same smooth-path technique as
// AttendanceTrendChart.tsx), Recent System Activity (timeline list),
// Quick Actions (2-col grid of real links to existing Super Admin
// routes — same pattern as QuickActionsPanel.tsx), System Status
// (service indicator list).
"use client";

import { useRef } from "react";
import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import {
  UserPlus,
  Users,
  Building2,
  GraduationCap,
  ClipboardList,
  FileBarChart,
  UserRoundPlus,
  DoorClosed,
} from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { cn } from "@/lib/cn";
import {
  ATTENDANCE_ANALYTICS,
  ATTENDANCE_LEGEND,
  RECENT_SYSTEM_ACTIVITY,
  SUPER_ADMIN_QUICK_ACTIONS,
  SYSTEM_STATUS,
  SYSTEM_STATUS_SUMMARY,
  type SystemActivityIcon,
  type QuickActionIcon,
} from "@/lib/super-admin-dashboard-mock";

const WIDTH = 320;
const HEIGHT = 170;
const PADDING_Y = 18;
const PADDING_X = 10;

type Point = { x: number; y: number };

function buildSmoothPath(points: Point[]): string {
  const first = points[0];
  if (!first) return "";
  let path = `M ${first.x},${first.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    if (current && next) {
      const controlX = (current.x + next.x) / 2;
      path += ` C ${controlX},${current.y} ${controlX},${next.y} ${next.x},${next.y}`;
    }
  }
  return path;
}

function AttendanceAnalyticsChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  const usableWidth = WIDTH - PADDING_X * 2;
  const usableHeight = HEIGHT - PADDING_Y * 2;
  const step = ATTENDANCE_ANALYTICS.length > 1 ? usableWidth / (ATTENDANCE_ANALYTICS.length - 1) : 0;

  const seriesPaths = ATTENDANCE_LEGEND.map((series) => {
    const points = ATTENDANCE_ANALYTICS.map((point, i) => ({
      x: PADDING_X + i * step,
      y: PADDING_Y + (1 - point[series.key] / 100) * usableHeight,
    }));
    return { ...series, path: buildSmoothPath(points) };
  });

  useGSAP(
    () => {
      const paths = containerRef.current
        ? gsap.utils.toArray<SVGPathElement>(".analytics-line", containerRef.current)
        : [];
      const scrollerEl = document.getElementById("dashboard-scroll-container") || undefined;

      if (paths.length === 0) return;

      if (prefersReducedMotion()) {
        gsap.set(paths, { strokeDasharray: "none", strokeDashoffset: 0 });
        return;
      }

      paths.forEach((p) => {
        const length = p.getTotalLength();
        gsap.set(p, { strokeDasharray: length, strokeDashoffset: length });
      });

      gsap.to(paths, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: "power3.inOut",
        stagger: 0.15,
        scrollTrigger: {
          trigger: containerRef.current,
          scroller: scrollerEl,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: containerRef, dependencies: [ATTENDANCE_ANALYTICS] }
  );

  return (
    <DashboardCard
      title="Attendance Analytics"
      action={
        <div className="flex items-center gap-3.5">
          {ATTENDANCE_LEGEND.map((series) => (
            <span key={series.key} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-heading/60">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: series.color }} />
              {series.label}
            </span>
          ))}
        </div>
      }
      className="flex h-full flex-col"
      headerClassName="flex-wrap"
      bodyClassName="flex flex-1 flex-col px-4 pb-4 pt-3 sm:px-6"
    >
      <div ref={containerRef} className="relative flex flex-1 gap-3">
        <div className="flex flex-col justify-between py-1 text-[10px] font-semibold text-heading/35 select-none sm:text-[11px]">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>

        <div className="relative min-h-[160px] flex-1 pt-1">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full overflow-visible">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1="0"
                y1={PADDING_Y + ratio * usableHeight}
                x2={WIDTH}
                y2={PADDING_Y + ratio * usableHeight}
                stroke="#f1f5f9"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
            ))}

            {seriesPaths.map(
              (series) =>
                series.path && (
                  <path
                    key={series.key}
                    className="analytics-line"
                    d={series.path}
                    fill="none"
                    stroke={series.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )
            )}
          </svg>
        </div>
      </div>

      <div className="mt-3 flex pl-7 text-[10.5px] font-semibold text-heading/35 sm:pl-9 sm:text-[11.5px]">
        {ATTENDANCE_ANALYTICS.map((p) => (
          <span key={p.label} className="flex-1 text-center">
            {p.label}
          </span>
        ))}
      </div>
    </DashboardCard>
  );
}

const ACTIVITY_ICONS: Record<SystemActivityIcon, ComponentType<SVGProps<SVGSVGElement>>> = {
  warden: UserRoundPlus,
  student: GraduationCap,
  room: DoorClosed,
  block: Building2,
  report: FileBarChart,
};

function RecentSystemActivity() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rows = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".activity-row", containerRef.current)
        : [];
      const scrollerEl = document.getElementById("dashboard-scroll-container") || undefined;

      if (prefersReducedMotion()) {
        gsap.set(rows, { opacity: 1, x: 0 });
        return;
      }

      gsap.fromTo(
        rows,
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
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
    <DashboardCard title="Recent System Activity" className="flex h-full flex-col" bodyClassName="flex flex-1 flex-col px-4 pb-4 pt-3">
      <div ref={containerRef} className="flex flex-1 flex-col">
        {RECENT_SYSTEM_ACTIVITY.map((item, i) => {
          const Icon = ACTIVITY_ICONS[item.icon];
          const isLast = i === RECENT_SYSTEM_ACTIVITY.length - 1;
          return (
            <div key={item.id} className="activity-row relative flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                {!isLast && <span className="mt-1 w-px flex-1 bg-heading/[0.08]" />}
              </div>
              <div className="min-w-0 pt-1">
                <p className="text-[13px] font-semibold text-heading">{item.text}</p>
                <p className="mt-0.5 text-[11.5px] font-medium text-heading/45">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}

const QUICK_ACTION_ICONS: Record<QuickActionIcon, ComponentType<SVGProps<SVGSVGElement>>> = {
  createWarden: UserPlus,
  manageWardens: Users,
  manageBlocks: Building2,
  studentReport: GraduationCap,
  attendance: ClipboardList,
  generateReport: FileBarChart,
};

function SuperAdminQuickActions() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const buttons = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".sa-quick-action-btn", containerRef.current)
        : [];
      const scrollerEl = document.getElementById("dashboard-scroll-container") || undefined;

      if (prefersReducedMotion()) {
        gsap.set(buttons, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.fromTo(
        buttons,
        { opacity: 0, y: 16, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(1.4)",
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
    <DashboardCard title="Quick Actions" className="flex h-full flex-col" bodyClassName="flex flex-1 flex-col px-3.5 pb-4 pt-3">
      <div ref={containerRef} className="grid grid-cols-2 gap-2.5">
        {SUPER_ADMIN_QUICK_ACTIONS.map((action) => {
          const Icon = QUICK_ACTION_ICONS[action.icon];
          return (
            <Link
              key={action.id}
              href={action.href}
              className={
                "sa-quick-action-btn group relative flex flex-col items-start gap-2 rounded-2xl " +
                "border border-heading/[0.08] bg-white/70 p-3 text-left backdrop-blur-md " +
                "shadow-xs transition-all duration-300 ease-out " +
                "hover:-translate-y-1 hover:border-primary/40 hover:bg-white hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98]"
              }
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[12px] font-semibold leading-tight text-heading/80 group-hover:text-heading">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
}

const STATUS_DOT_COLOR: Record<string, string> = {
  blue: "bg-sky-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
};

function SystemStatusCard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rows = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".status-row", containerRef.current)
        : [];
      const scrollerEl = document.getElementById("dashboard-scroll-container") || undefined;

      if (prefersReducedMotion()) {
        gsap.set(rows, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        rows,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
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
    <DashboardCard title="System Status" className="flex h-full flex-col" bodyClassName="flex flex-1 flex-col justify-between px-4 pb-4 pt-3">
      <div ref={containerRef} className="flex flex-col gap-3">
        {SYSTEM_STATUS.map((item) => (
          <div key={item.id} className="status-row flex items-center justify-between gap-2 text-[12.5px]">
            <span className="flex items-center gap-2 font-semibold text-heading/70">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT_COLOR[item.dot])} />
              {item.label}
            </span>
            <span className="font-semibold text-emerald-600">{item.status}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-heading/[0.06] pt-3 text-[12px] font-medium text-heading/50">
        System Status: <span className="font-semibold text-emerald-600">{SYSTEM_STATUS_SUMMARY}</span>
      </p>
    </DashboardCard>
  );
}

export function SuperAdminThirdRow() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_0.9fr] xl:gap-5">
      <AttendanceAnalyticsChart />
      <RecentSystemActivity />
      <SuperAdminQuickActions />
      <SystemStatusCard />
    </div>
  );
}
