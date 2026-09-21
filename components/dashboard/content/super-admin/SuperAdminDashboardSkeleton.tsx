// components/dashboard/content/super-admin/SuperAdminDashboardSkeleton.tsx
//
// Loading skeleton preserving the exact Super Admin Dashboard grid layout,
// card dimensions, and Liquid Glass styling. Renders as a single unified
// unit until live MongoDB data is ready.
"use client";

import {
  TrendingUp,
  ShieldCheck,
  MapPinned,
  KeyRound,
  Gauge,
  Users2,
} from "lucide-react";

export function SuperAdminDashboardSkeleton() {
  const statIcons = [
    { label: "Total Students", icon: TrendingUp },
    { label: "Total Wardens", icon: ShieldCheck },
    { label: "Total Hostel Blocks", icon: MapPinned },
    { label: "Total Rooms", icon: KeyRound },
    { label: "Room Occupancy", icon: Gauge },
    { label: "Active Users", icon: Users2 },
  ];

  return (
    <div
      aria-busy="true"
      aria-label="Loading Super Admin dashboard data"
      className="flex w-full flex-col gap-5 pb-2 pt-4 xl:gap-6 xl:pt-5 transition-opacity duration-300"
    >
      {/* ── ROW 1: Welcome Card Skeleton ── */}
      <div className="relative flex min-h-[108px] w-full flex-col justify-center gap-2 rounded-[20px] border border-white/60 bg-gradient-to-br from-white/90 via-purple-50/60 to-indigo-50/50 p-6 shadow-lg shadow-purple-500/5 backdrop-blur-[17.4px]">
        <div className="h-7 w-56 rounded-xl bg-slate-200/70 animate-pulse xl:h-8 xl:w-64" />
        <div className="h-4 w-72 max-w-full rounded-md bg-slate-200/50 animate-pulse" />
      </div>

      {/* ── ROW 2: 6 Stat Cards Skeleton ── */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6 xl:gap-4">
        {statIcons.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="sa-dashboard-card group relative flex flex-col justify-between overflow-hidden rounded-[22px] border border-white/60 bg-white/70 p-4 backdrop-blur-[20px] shadow-xs xl:p-5"
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
              <div className="relative z-10 mt-2">
                <div className="h-3.5 w-24 rounded bg-slate-200/50 animate-pulse" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ROW 3: Second Row (4 cards) Skeleton ── */}
      <div className="xl:min-h-[300px]">
        <div className="grid h-full min-h-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {/* Student Overview Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--violet flex h-full flex-col min-h-[300px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="border-b border-heading/5 pb-3">
              <span className="text-[14px] font-bold text-heading">Student Overview</span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center py-4">
              <div className="h-[168px] w-[168px] rounded-full border-[16px] border-slate-200/60 animate-pulse" />
              <div className="mt-4 flex gap-4">
                <div className="h-4 w-20 rounded bg-slate-200/60 animate-pulse" />
                <div className="h-4 w-20 rounded bg-slate-200/60 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Hostel Occupancy Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--pearl flex h-full flex-col min-h-[300px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="border-b border-heading/5 pb-3">
              <span className="text-[14px] font-bold text-heading">Hostel Occupancy</span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center py-4">
              <div className="h-[168px] w-[168px] rounded-full border-[16px] border-slate-200/60 animate-pulse" />
              <div className="mt-4 flex flex-col gap-1.5 w-full px-6">
                <div className="h-3.5 w-full rounded bg-slate-200/60 animate-pulse" />
                <div className="h-3.5 w-3/4 rounded bg-slate-200/60 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Hostel Block Overview Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--lilac flex h-full flex-col min-h-[300px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="border-b border-heading/5 pb-3">
              <span className="text-[14px] font-bold text-heading">Hostel Block Overview</span>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-4 py-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 rounded bg-slate-200/70 animate-pulse" />
                    <div className="h-4 w-12 rounded bg-slate-200/70 animate-pulse" />
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200/60 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Warden Overview Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--mist flex h-full flex-col min-h-[300px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="border-b border-heading/5 pb-3">
              <span className="text-[14px] font-bold text-heading">Warden Overview</span>
            </div>
            <div className="flex flex-1 flex-col gap-3 py-3">
              <div className="h-4 w-32 rounded bg-slate-200/60 animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-heading/[0.04] last:border-0">
                  <div className="h-4 w-24 rounded bg-slate-200/70 animate-pulse" />
                  <div className="h-4 w-16 rounded bg-slate-200/60 animate-pulse" />
                  <div className="h-5 w-14 rounded-full bg-slate-200/60 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 4: Third Row (4 cards) Skeleton ── */}
      <div className="xl:min-h-[280px]">
        <div className="grid h-full min-h-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_0.9fr] xl:gap-5">
          {/* Attendance Analytics Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--violet flex h-full flex-col min-h-[260px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="border-b border-heading/5 pb-3">
              <span className="text-[14px] font-bold text-heading">Attendance Analytics</span>
            </div>
            <div className="flex flex-1 items-center justify-between gap-3 pt-4">
              <div className="flex flex-col justify-between h-32 text-[10.5px] font-semibold text-slate-300">
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
              <div className="flex-1 flex flex-col justify-between h-32 border-l border-b border-slate-100/80 px-2 py-1">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="w-full border-b border-dashed border-slate-100" />
                ))}
              </div>
            </div>
          </div>

          {/* Recent System Activity Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--pearl flex h-full flex-col min-h-[260px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="border-b border-heading/5 pb-3">
              <span className="text-[14px] font-bold text-heading">Recent System Activity</span>
            </div>
            <div className="flex flex-1 flex-col gap-3 pt-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-200/70 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3.5 w-32 rounded bg-slate-200/70 animate-pulse" />
                    <div className="h-2.5 w-16 rounded bg-slate-200/50 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--lilac flex h-full flex-col min-h-[260px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="border-b border-heading/5 pb-3">
              <span className="text-[14px] font-bold text-heading">Quick Actions</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex h-[78px] flex-col items-center justify-center rounded-xl border border-white/60 bg-white/50 p-2 gap-1 animate-pulse"
                >
                  <div className="h-7 w-7 rounded-lg bg-slate-200/70" />
                  <div className="h-2.5 w-14 rounded bg-slate-200/60" />
                </div>
              ))}
            </div>
          </div>

          {/* System Status Skeleton */}
          <div className="sa-dashboard-card sa-dashboard-card--mist flex h-full flex-col min-h-[260px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
            <div className="border-b border-heading/5 pb-3">
              <span className="text-[14px] font-bold text-heading">System Status</span>
            </div>
            <div className="flex flex-1 flex-col justify-between py-3">
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-3.5 w-20 rounded bg-slate-200/60 animate-pulse" />
                    <div className="h-3.5 w-16 rounded bg-slate-200/60 animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="h-3 w-32 rounded bg-slate-200/50 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

