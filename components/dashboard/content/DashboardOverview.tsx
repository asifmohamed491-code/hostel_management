// components/dashboard/content/DashboardOverview.tsx
//
// The Warden dashboard content area (welcome/attendance, stat cards,
// charts, quick actions, recent activity — Figma node 136:31).
// Governed by a centralized WardenAttendanceStatsProvider to ensure:
// 1. Unified loading state (everything loads together as ONE unit)
// 2. No old/mock data flash
// 3. Silent background refresh without full-page reloads or animation restarts
"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import {
  WardenAttendanceStatsProvider,
  useWardenAttendanceStats,
} from "@/hooks/useWardenAttendanceStats";
import { DashboardSkeleton } from "@/components/dashboard/content/DashboardSkeleton";
import { WelcomeAttendanceRow } from "@/components/dashboard/content/WelcomeAttendanceRow";
import { WardenAttendanceCard } from "@/components/dashboard/content/warden/WardenAttendanceCard";
import { StatCardsRow } from "@/components/dashboard/content/StatCardsRow";
import { ChartsRow } from "@/components/dashboard/content/ChartsRow";
import { BottomRow } from "@/components/dashboard/content/BottomRow";

function DashboardContent() {
  const { isDashboardReady, error, refetch } = useWardenAttendanceStats();

  // If there was an error and no previous data could be loaded
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
              An error occurred while communicating with the server.
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

  // Unified loading state: render complete skeleton until ALL data is ready
  if (!isDashboardReady) {
    return <DashboardSkeleton />;
  }

  // Once ready: render the ENTIRE real dashboard at once
  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5 transition-opacity duration-300">
      <div className="xl:h-[232px] xl:shrink-0">
        <WelcomeAttendanceRow />
      </div>

      <div className="w-full">
        <WardenAttendanceCard />
      </div>

      <div className="xl:shrink-0">
        <StatCardsRow />
      </div>

      <div className="xl:min-h-[210px]">
        <ChartsRow />
      </div>

      <div className="xl:h-[228px] xl:shrink-0 xl:pb-1">
        <BottomRow />
      </div>
    </div>
  );
}

export function DashboardOverview() {
  return (
    <WardenAttendanceStatsProvider>
      <DashboardContent />
    </WardenAttendanceStatsProvider>
  );
}
