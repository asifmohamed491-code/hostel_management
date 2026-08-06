// AttendanceTrendChart.tsx
//
// Matches Figma node 149:120 "Attendance Trend Line Chart": filled
// area + line, 0/25/50/75/100 y-axis, weekday x-axis. Hand-built SVG
// (no charting library added). The source file's x-axis labels were
// garbled ("Tam", "Sep", "Tum", "Wen") — replaced with the same Mon–Sat
// labels used by the bar chart alongside it so the row reads
// consistently; sizing/position/style otherwise untouched.
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { WEEKLY_ATTENDANCE } from "@/lib/dashboard-mock";

const WIDTH = 300;
const HEIGHT = 140;

function buildPoints() {
  const step = WIDTH / (WEEKLY_ATTENDANCE.length - 1);
  return WEEKLY_ATTENDANCE.map((point, i) => ({
    x: i * step,
    y: HEIGHT - (point.value / 100) * HEIGHT,
    label: point.label,
  }));
}

export function AttendanceTrendChart() {
  const points = buildPoints();
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  return (
    <DashboardCard title="Attendance Trend Line Chart" className="flex h-full flex-col" bodyClassName="flex flex-1 flex-col px-[19px] pb-4 pt-3">
      <div className="flex flex-1 gap-2">
        <div className="flex flex-col justify-between py-1 text-[11.4px] text-heading/40">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-full flex-1">
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c5cd6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#7c5cd6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#trendFill)" />
          <path d={linePath} fill="none" stroke="#7c5cd6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="mt-1 flex pl-7 text-[11.4px] text-heading/40">
        {points.map((p) => (
          <span key={p.label} className="flex-1 text-center">
            {p.label}
          </span>
        ))}
      </div>
    </DashboardCard>
  );
}
