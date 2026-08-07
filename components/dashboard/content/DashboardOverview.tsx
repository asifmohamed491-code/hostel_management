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
import { StatCardsRow } from "@/components/dashboard/content/StatCardsRow";
import { ChartsRow } from "@/components/dashboard/content/ChartsRow";
import { BottomRow } from "@/components/dashboard/content/BottomRow";

// Layout note: at `xl:` and up this fills the viewport with no page
// scroll, same as the Figma frame — the middle "charts" row is the
// flexible one (`xl:flex-1`) while the other three rows keep a fixed
// height, so the four rows always add up to exactly the space below
// the top bar. Below `xl:` (tablet/mobile) it falls back to a normal
// stacked, scrollable layout, since cramming a 6-card stat row + a
// 4-column chart row + a wide table into a small screen without
// scroll isn't usable — the "no scrolling" request is a desktop-only
// constraint by nature of the source design.
export function DashboardOverview() {
  return (
    <div className="flex min-h-full w-full flex-col gap-4 pt-4 xl:h-full xl:min-h-0 xl:gap-5 xl:pt-5">
      <div className="xl:h-[232px] xl:shrink-0">
        <WelcomeAttendanceRow />
      </div>

      <div className="xl:shrink-0">
        <StatCardsRow />
      </div>

      <div className="xl:min-h-[210px] xl:flex-1">
        <ChartsRow />
      </div>

      <div className="xl:h-[228px] xl:shrink-0 xl:pb-1">
        <BottomRow />
      </div>
    </div>
  );
}
