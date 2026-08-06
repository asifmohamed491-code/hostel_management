// ChartsRow.tsx
//
// Matches Figma's 4-card "Charts row" (Attendance Ring Chart,
// Attendance Trend Line Chart, Weekly Attendance Bar Chart, Recent
// Check-ins), equal-width, single row on desktop.
import { AttendanceRingChart } from "@/components/dashboard/content/AttendanceRingChart";
import { AttendanceTrendChart } from "@/components/dashboard/content/AttendanceTrendChart";
import { WeeklyBarChart } from "@/components/dashboard/content/WeeklyBarChart";
import { RecentCheckins } from "@/components/dashboard/content/RecentCheckins";

export function ChartsRow() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      <AttendanceRingChart />
      <AttendanceTrendChart />
      <WeeklyBarChart />
      <RecentCheckins />
    </div>
  );
}
