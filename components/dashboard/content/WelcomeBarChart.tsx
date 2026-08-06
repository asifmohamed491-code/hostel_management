// WeeklyBarChart.tsx
//
// Matches Figma node 149:135 "Weekly Attendance Bar Chart": 6 bars,
// Mon–Sat, 0–100 axis. Hand-built with CSS heights (no charting
// library added), same data source as the ring/trend charts.
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { WEEKLY_ATTENDANCE } from "@/lib/dashboard-mock";

export function WeeklyBarChart() {
  return (
    <DashboardCard
      title="Weekly Attendance Bar Chart"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col px-[19px] pb-4 pt-3"
    >
      <div className="flex flex-1 gap-2">
        <div className="flex flex-col justify-between py-1 text-[11.4px] text-heading/40">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>
        <div className="flex flex-1 items-end justify-between gap-2">
          {WEEKLY_ATTENDANCE.map((point) => (
            <div key={point.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-full w-full max-w-[26px] items-end overflow-hidden rounded-full bg-heading/[0.06]">
                <div
                  className="w-full rounded-full bg-[#7c5cd6]"
                  style={{ height: `${point.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 flex pl-7 text-[11.4px] text-heading/40">
        {WEEKLY_ATTENDANCE.map((point) => (
          <span key={point.label} className="flex-1 text-center">
            {point.label}
          </span>
        ))}
      </div>
    </DashboardCard>
  );
}
