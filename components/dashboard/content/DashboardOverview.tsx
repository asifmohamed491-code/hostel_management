// DashboardOverview.tsx
// The Warden dashboard content area (welcome/attendance, stat cards,
// charts, quick actions, recent activity — Figma node 136:31), pulled
// out of app/dashboard/page.tsx into its own component so it has a
// single implementation that multiple routes can render:
//   - app/dashboard/page.tsx        (generic /dashboard)
//   - app/dashboard/warden/page.tsx (the Warden's role-home route)
// Sidebar, Top Navigation, and the fixed background are provided by
// DashboardLayout (app/dashboard/layout.tsx) and are untouched here.
import { WelcomeAttendanceRow } from "@/components/dashboard/content/WelcomeAttendanceRow";
import { WardenAttendanceCard } from "@/components/dashboard/content/warden/WardenAttendanceCard";
import { StatCardsRow } from "@/components/dashboard/content/StatCardsRow";
import { ChartsRow } from "@/components/dashboard/content/ChartsRow";
import { BottomRow } from "@/components/dashboard/content/BottomRow";

// Layout note: this stacks the rows with natural, content-driven
// heights and a consistent gap — no row is squeezed into "whatever
// space is left." <main> (DashboardLayout.tsx) already scrolls
// independently of the Sidebar, so there's no need to force everything
// to fit exactly inside the viewport here.
export function DashboardOverview() {
  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
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
