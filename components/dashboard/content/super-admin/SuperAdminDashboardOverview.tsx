// SuperAdminDashboardOverview.tsx
//
// The Super Admin dashboard content area: Welcome card, 6-card stat row,
// second row (Student Overview / Hostel Occupancy / Hostel Block Overview /
// Warden Overview), third row (Attendance Analytics / Recent System Activity
// / Quick Actions / System Status).
//
// Governed by SuperAdminDashboardProvider to ensure:
// 1. Unified loading state (renders SuperAdminDashboardSkeleton until ready)
// 2. Error state with Retry button
// 3. Silent 15-second background refresh without screen flicker
"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { WelcomeCard } from "@/components/dashboard/content/WelcomeAttendanceRow";
import { SuperAdminStatCardsRow } from "@/components/dashboard/content/super-admin/SuperAdminStatCardsRow";
import { SuperAdminSecondRow } from "@/components/dashboard/content/super-admin/SuperAdminSecondRow";
import { SuperAdminThirdRow } from "@/components/dashboard/content/super-admin/SuperAdminThirdRow";
import { SuperAdminDashboardSkeleton } from "@/components/dashboard/content/super-admin/SuperAdminDashboardSkeleton";
import {
  SuperAdminDashboardProvider,
  useSuperAdminDashboard,
} from "@/hooks/useSuperAdminDashboard";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function SuperAdminDashboardContent() {
  const { user, loading: userLoading } = useCurrentUser();
  const { isDashboardReady, error, refetch } = useSuperAdminDashboard();

  const firstName = user?.fullName?.trim().split(/\s+/)[0];
  const displayName = userLoading || !firstName ? "Admin" : firstName;

  if (error && !isDashboardReady) {
    return (
      <div className="flex w-full flex-col items-center justify-center min-h-[380px] px-4 py-12">
        <div className="sa-dashboard-card flex flex-col items-center gap-4 rounded-[22px] border border-white/60 bg-white/70 p-8 text-center backdrop-blur-[20px] shadow-lg max-w-md w-full">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-heading sm:text-[20px]">
              Unable to load dashboard data
            </h2>
            <p className="mt-1.5 text-[13px] font-medium text-heading/55">
              {error || "An error occurred while communicating with the server."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-[13.5px] font-semibold text-white shadow-glass transition-all hover:bg-primary-dark cursor-pointer active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isDashboardReady) {
    return <SuperAdminDashboardSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-5 pb-2 pt-4 xl:gap-6 xl:pt-5 transition-opacity duration-300">
      <WelcomeCard
        greeting="Welcome back,"
        name={`${displayName}`}
        description="Here's your hostel system overview for today."
      />

      <SuperAdminStatCardsRow />
      <div className="xl:min-h-[300px]">
        <SuperAdminSecondRow />
      </div>
      <div className="xl:min-h-[280px]">
        <SuperAdminThirdRow />
      </div>
    </div>
  );
}

export function SuperAdminDashboardOverview() {
  return (
    <SuperAdminDashboardProvider>
      <SuperAdminDashboardContent />
    </SuperAdminDashboardProvider>
  );
}
