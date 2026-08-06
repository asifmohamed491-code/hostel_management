// AttendanceRingChart.tsx
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { RadialProgress } from "@/components/dashboard/content/RadialProgress";
import { ATTENDANCE_RING_PCT } from "@/lib/dashboard-mock";

export function AttendanceRingChart() {
  return (
    <DashboardCard
      title="Attendance Ring Chart"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 items-center justify-center pb-5"
    >
      <RadialProgress value={ATTENDANCE_RING_PCT} size={140} strokeWidth={13}>
        <div className="flex flex-col items-center text-center">
          <span className="text-sm font-medium text-heading/70">Attendance</span>
          <span className="text-sm font-medium text-heading/70">Ring Chart</span>
        </div>
      </RadialProgress>
    </DashboardCard>
  );
}
