// components/dashboard/content/DashboardSkeleton.tsx
//
// Complete Warden Dashboard loading skeleton preserving the exact card
// dimensions, grid structure, spacing, and Liquid Glass styling.
// Renders as a single unified loading unit until all MongoDB data is ready.
"use client";

import { BedDouble, CircleCheck, CircleMinus, Flag, Gauge, Users, QrCode } from "lucide-react";

export function DashboardSkeleton() {
  const statLabels = [
    { label: "Total Students", icon: Users },
    { label: "Total Rooms", icon: BedDouble },
    { label: "Present Today", icon: CircleCheck },
    { label: "Absent Today", icon: CircleMinus },
    { label: "Active Complaints", icon: Flag },
    { label: "Room Occupancy", icon: Gauge },
  ];

  return (
    <div
      aria-busy="true"
      aria-label="Loading dashboard data"
      className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5 transition-opacity duration-300"
    >
      {/* ── ROW 1: Welcome & Today's Attendance ── */}
      <div className="xl:h-[232px] xl:shrink-0">
        <div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row xl:gap-6">
          {/* Welcome Card Skeleton */}
          <div className="relative flex h-full flex-1 flex-col justify-center gap-4 rounded-[20px] border border-white/60 p-6 xl:p-8 bg-gradient-to-br from-white/90 via-purple-50/60 to-indigo-50/50 shadow-lg shadow-purple-500/5 backdrop-blur-[17.4px]">
            <div className="space-y-2">
              <div className="h-8 w-44 rounded-xl bg-slate-200/70 animate-pulse xl:h-10 xl:w-52" />
              <div className="h-8 w-36 rounded-xl bg-slate-200/70 animate-pulse xl:h-10 xl:w-44" />
            </div>
            <div className="space-y-1.5 mt-1">
              <div className="h-3.5 w-72 max-w-full rounded-md bg-slate-200/60 animate-pulse xl:h-4" />
              <div className="h-3.5 w-52 max-w-full rounded-md bg-slate-200/50 animate-pulse xl:h-4" />
            </div>
          </div>

          {/* Today Attendance Card Skeleton */}
          <div
            className="relative h-full flex-1 overflow-hidden rounded-[20px]"
            style={{
              backgroundImage:
                "radial-gradient(120% 140% at 0% 0%, #bfe9dd 0%, rgba(191,233,221,0) 45%), radial-gradient(120% 140% at 100% 100%, #f6b8d0 0%, rgba(246,184,208,0) 50%), radial-gradient(90% 120% at 80% 10%, #f3c98a 0%, rgba(243,201,138,0) 45%), linear-gradient(135deg, #8f6fe0 0%, #7c5cd6 45%, #6a49cf 100%)",
            }}
          >
            <div className="relative flex h-full flex-col p-5 xl:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-heading xl:text-[18px]">
                  Today&apos;s Attendance
                </h2>
                <span className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold text-primary shadow-xs backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  Loading…
                </span>
              </div>

              <div className="mt-1 h-3 w-40 rounded bg-white/30 animate-pulse" />

              <div className="mt-4 flex flex-1 items-center justify-between gap-3 xl:mt-5 xl:gap-4">
                <div className="flex flex-1 flex-wrap gap-2.5 xl:gap-3">
                  {["Present", "Late", "Absent"].map((label) => (
                    <div
                      key={label}
                      className="min-w-[80px] flex-1 rounded-xl border border-white/60 bg-white/30 px-4 py-2.5 backdrop-blur-[10.8px] xl:px-5 xl:py-3"
                    >
                      <p className="text-[12.5px] font-semibold text-heading/70 xl:text-sm">
                        {label}
                      </p>
                      <div className="mt-1 h-6 w-10 rounded-md bg-white/50 animate-pulse xl:h-7" />
                    </div>
                  ))}
                </div>

                <div className="relative hidden shrink-0 items-center justify-center sm:flex h-[120px] w-[120px] xl:h-[128px] xl:w-[128px]">
                  <svg width="120" height="120" className="-rotate-90 transform">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="11"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="h-5 w-10 rounded bg-white/50 animate-pulse" />
                    <span className="mt-1 text-[10px] font-semibold text-heading/70">
                      Attendance %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Warden Attendance Session ── */}
      <div className="w-full">
        <section className="sa-dashboard-card w-full rounded-[20px] border border-white/10 bg-white/[0.79] shadow-sm backdrop-blur-[30px]">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
            <div className="flex flex-col justify-center gap-4 px-5 py-6 sm:px-10 sm:py-8 lg:py-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 sm:h-14 sm:w-14">
                <QrCode className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
              </div>
              <div className="space-y-1.5">
                <div className="h-6 w-48 rounded-lg bg-slate-200/70 animate-pulse" />
                <div className="h-4 w-72 max-w-full rounded-md bg-slate-200/50 animate-pulse" />
              </div>
              <div className="h-12 w-48 rounded-2xl bg-slate-200/70 animate-pulse mt-1" />
            </div>
            <div className="hidden items-center justify-center border-l border-white/20 px-8 py-8 lg:flex">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-dashed border-heading/10 bg-heading/[0.03]">
                  <QrCode className="h-10 w-10 text-heading/15" />
                </div>
                <div className="h-3.5 w-36 rounded bg-slate-200/50 animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── ROW 3: Stat Cards ── */}
      <div className="xl:shrink-0">
        <div className="grid grid-cols-2 gap-3 sm:gap-3.5 sm:grid-cols-3 xl:flex xl:gap-4.5">
          {statLabels.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-[22px] border border-white/60 bg-white/70 p-3.5 sm:p-4 backdrop-blur-[20px] xl:p-5 shadow-xs"
              >
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-heading/45 xl:text-[11.5px]">
                    {item.label}
                  </p>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="relative z-10 mt-3">
                  <div className="h-8 w-16 rounded-lg bg-slate-200/70 animate-pulse xl:h-9 xl:w-20" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ROW 4: Charts Row ── */}
      <div className="xl:min-h-[210px]">
        <div className="grid h-full min-h-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {/* Ring Chart Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--violet flex h-full flex-col min-h-[280px] rounded-[22px] border border-white/60 bg-white/70 p-6 backdrop-blur-[20px]">
            <div className="flex items-center justify-between border-b border-heading/5 pb-3">
              <span className="text-[14px] font-bold text-heading">Attendance Overview</span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center">
                <svg width="140" height="140" className="-rotate-90 transform">
                  <circle
                    cx="70"
                    cy="70"
                    r="64"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <div className="h-6 w-12 rounded bg-slate-200/70 animate-pulse" />
                  <span className="mt-1 text-[10px] font-medium text-slate-400 uppercase">
                    Present Today
                  </span>
                </div>
              </div>
              <div className="mt-4 h-6 w-28 rounded-full bg-slate-200/60 animate-pulse" />
            </div>
          </div>

          {/* Trend Chart Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--pearl flex h-full flex-col min-h-[280px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="flex items-center justify-between border-b border-heading/5 pb-3">
              <span className="text-[14px] font-bold text-heading">Attendance Trend Chart</span>
            </div>
            <div className="flex flex-1 items-center justify-between gap-3 pt-4">
              <div className="flex flex-col justify-between h-36 text-[10.5px] font-semibold text-slate-300">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>
              <div className="flex-1 flex flex-col justify-between h-36 border-l border-b border-slate-100/80 px-2 py-1">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="w-full border-b border-dashed border-slate-100" />
                ))}
              </div>
            </div>
            <div className="mt-3 flex pl-7 text-[10.5px] font-semibold text-slate-300">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day} className="flex-1 text-center">
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* Weekly Bar Chart Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--lilac flex h-full flex-col min-h-[280px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="flex items-center justify-between border-b border-heading/5 pb-3">
              <span className="text-[14px] font-bold text-heading">Weekly Attendance Bar Chart</span>
            </div>
            <div className="flex flex-1 items-end justify-between gap-2 pt-4 px-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex h-36 flex-1 items-end justify-center">
                  <div className="w-full max-w-[24px] h-full rounded-full bg-slate-100/90 overflow-hidden flex items-end p-0.5">
                    <div
                      className="w-full rounded-full bg-slate-200/70 animate-pulse"
                      style={{ height: `${20 + i * 12}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex text-[10.5px] font-semibold text-slate-300">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day} className="flex-1 text-center">
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Check-ins Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--mist flex h-full flex-col min-h-[280px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-[14px] font-bold text-heading">Recent Check-ins</span>
            </div>
            <div className="flex flex-col justify-start gap-2.5 pt-2.5 pb-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-2 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-slate-200/80 shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="h-3.5 w-24 rounded bg-slate-200/80" />
                    <div className="h-2.5 w-16 rounded bg-slate-200/60" />
                  </div>
                  <div className="h-6 w-14 rounded-full bg-slate-200/60 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 5: Recent Attendance Table & Quick Actions ── */}
      <div className="xl:h-[228px] xl:shrink-0 xl:pb-1">
        <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr] xl:gap-6">
          {/* Table Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--pearl flex h-full flex-col rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="flex items-center justify-between border-b border-heading/5 pb-2.5">
              <span className="text-[14px] font-bold text-heading">Recent Attendance Table</span>
            </div>
            <div className="flex flex-1 flex-col justify-around py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 py-2 animate-pulse border-b border-heading/[0.04] last:border-0">
                  <div className="h-3.5 w-3.5 rounded bg-slate-200/70 shrink-0" />
                  <div className="h-8 w-8 rounded-full bg-slate-200/80 shrink-0" />
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="h-3.5 w-28 rounded bg-slate-200/80" />
                    <div className="h-2.5 w-16 rounded bg-slate-200/60" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-slate-200/60 shrink-0" />
                  <div className="h-3.5 w-24 rounded bg-slate-200/50 shrink-0 hidden sm:block" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--violet flex h-full flex-col rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="flex items-center justify-between border-b border-heading/5 pb-2.5">
              <span className="text-[14px] font-bold text-heading">Quick Actions</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center rounded-xl border border-white/60 bg-white/50 p-4 gap-2 animate-pulse"
                >
                  <div className="h-8 w-8 rounded-xl bg-slate-200/70" />
                  <div className="h-3 w-16 rounded bg-slate-200/60" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

