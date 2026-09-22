// components/dashboard/content/student/StudentDashboardSkeleton.tsx
//
// Complete Student Dashboard loading skeleton preserving the exact card
// dimensions, grid structure, spacing, and Liquid Glass styling.
// Renders as a single unified loading unit until all student data is ready.
"use client";

export function StudentDashboardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading student dashboard data"
      className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5 transition-opacity duration-300"
    >
      {/* ── ROW 1: Welcome Card Skeleton ── */}
      <div className="relative flex min-h-[108px] w-full flex-col justify-center gap-2.5 rounded-[20px] border border-white/60 bg-gradient-to-br from-white/90 via-purple-50/60 to-indigo-50/50 p-6 shadow-lg shadow-purple-500/5 backdrop-blur-[17.4px]">
        <div className="h-7 w-52 rounded-xl bg-slate-200/70 animate-pulse xl:h-8 xl:w-60" />
        <div className="h-4 w-72 max-w-full rounded-md bg-slate-200/50 animate-pulse" />
        <div className="h-3.5 w-96 max-w-full rounded-md bg-slate-200/40 animate-pulse mt-0.5" />
      </div>

      {/* ── ROW 2: StudentSummaryRow (4 cards) Skeleton ── */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4.5">
        {/* Card 1: My Room Skeleton */}
        <div className="sa-dashboard-card sa-dashboard-card--violet flex h-full flex-col min-h-[160px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
          <div className="border-b border-heading/5 pb-3">
            <span className="text-[14px] font-bold text-heading">My Room</span>
          </div>
          <div className="flex flex-1 items-center justify-between gap-4 pt-3 pb-1">
            <div className="flex flex-col gap-4">
              <div>
                <div className="h-3 w-12 rounded bg-slate-200/60 animate-pulse" />
                <div className="mt-1.5 h-5 w-20 rounded bg-slate-200/80 animate-pulse" />
              </div>
              <div>
                <div className="h-3 w-12 rounded bg-slate-200/60 animate-pulse" />
                <div className="mt-1.5 h-5 w-20 rounded bg-slate-200/80 animate-pulse" />
              </div>
            </div>
            <div className="h-[84px] w-[84px] rounded-2xl bg-slate-200/50 animate-pulse shrink-0" />
          </div>
        </div>

        {/* Card 2: Attendance Skeleton */}
        <div className="sa-dashboard-card sa-dashboard-card--pearl flex h-full flex-col min-h-[160px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
          <div className="border-b border-heading/5 pb-3">
            <span className="text-[14px] font-bold text-heading">Attendance</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 pt-2">
            <div className="h-[104px] w-[104px] rounded-full border-[10px] border-slate-200/60 animate-pulse" />
            <div className="h-4 w-36 rounded bg-slate-200/60 animate-pulse" />
          </div>
        </div>

        {/* Card 3: Today's Food Skeleton */}
        <div className="sa-dashboard-card sa-dashboard-card--lilac flex h-full flex-col min-h-[160px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
          <div className="border-b border-heading/5 pb-3">
            <span className="text-[14px] font-bold text-heading">Today&apos;s Food</span>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 pt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-slate-200/70 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3.5 w-32 rounded bg-slate-200/70 animate-pulse" />
                  <div className="h-2.5 w-20 rounded bg-slate-200/50 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Maintenance Requests Skeleton */}
        <div className="sa-dashboard-card sa-dashboard-card--mist flex h-full flex-col min-h-[160px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
          <div className="border-b border-heading/5 pb-3">
            <span className="text-[14px] font-bold text-heading">Maintenance Requests</span>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-3 pt-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-16 rounded bg-slate-200/60 animate-pulse" />
                <div className="h-4 w-8 rounded bg-slate-200/80 animate-pulse" />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-20 rounded bg-slate-200/60 animate-pulse" />
                <div className="h-4 w-8 rounded bg-slate-200/80 animate-pulse" />
              </div>
            </div>
            <div className="h-9 w-full rounded-2xl bg-slate-200/60 animate-pulse" />
          </div>
        </div>
      </div>

      {/* ── ROW 3: StudentBottomRow (4 cards) Skeleton ── */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4.5">
        {/* Card 1: Attendance Overview Skeleton */}
        <div className="sa-dashboard-card sa-dashboard-card--violet flex h-full flex-col min-h-[260px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
          <div className="border-b border-heading/5 pb-3">
            <span className="text-[14px] font-bold text-heading">Attendance Overview</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 pt-3">
            <div className="flex w-full items-center justify-center gap-5">
              <div className="h-[96px] w-[96px] rounded-full border-[10px] border-slate-200/60 animate-pulse" />
              <div className="flex h-[90px] items-end gap-2.5">
                <div className="h-full w-4 rounded-full bg-slate-200/60 animate-pulse" />
                <div className="h-3/4 w-4 rounded-full bg-slate-200/50 animate-pulse" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-3.5 w-16 rounded bg-slate-200/60 animate-pulse" />
              <div className="h-3.5 w-16 rounded bg-slate-200/60 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Card 2: My Room Details Skeleton */}
        <div className="sa-dashboard-card sa-dashboard-card--pearl flex h-full flex-col min-h-[260px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
          <div className="border-b border-heading/5 pb-3">
            <span className="text-[14px] font-bold text-heading">My Room Details</span>
          </div>
          <div className="flex flex-1 flex-col gap-3 pt-3">
            <div>
              <div className="h-3 w-12 rounded bg-slate-200/50 animate-pulse" />
              <div className="mt-1 h-4 w-20 rounded bg-slate-200/70 animate-pulse" />
            </div>
            <div className="space-y-2 mt-1">
              <div className="h-3 w-16 rounded bg-slate-200/50 animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2.5 py-1">
                  <div className="h-7 w-7 rounded-full bg-slate-200/70 animate-pulse shrink-0" />
                  <div className="h-3.5 w-24 rounded bg-slate-200/60 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Recent Notifications Skeleton */}
        <div className="sa-dashboard-card sa-dashboard-card--mist flex h-full flex-col min-h-[260px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
          <div className="border-b border-heading/5 pb-3">
            <span className="text-[14px] font-bold text-heading">Recent Notifications</span>
          </div>
          <div className="flex flex-1 flex-col gap-3 pt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-full bg-slate-200/70 animate-pulse shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-16 rounded bg-slate-200/50 animate-pulse" />
                  <div className="h-3.5 w-full rounded bg-slate-200/70 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Quick Actions Skeleton */}
        <div className="sa-dashboard-card sa-dashboard-card--lilac flex h-full flex-col min-h-[260px] rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px]">
          <div className="border-b border-heading/5 pb-3">
            <span className="text-[14px] font-bold text-heading">Quick Actions</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border border-white/60 bg-white/50 p-2 animate-pulse"
              >
                <div className="h-6 w-6 rounded-lg bg-slate-200/70" />
                <div className="h-2.5 w-14 rounded bg-slate-200/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

