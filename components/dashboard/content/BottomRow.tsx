// BottomRow.tsx
//
// Matches Figma's bottom row: wide "Recent Attendance Table" on the
// left, narrower "Quick Actions" panel on the right.
import { RecentAttendanceTable } from "@/components/dashboard/content/RecentAttendanceTable";
import { QuickActionsPanel } from "@/components/dashboard/content/QuickActionsPanel";

export function BottomRow() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr] xl:gap-6">
      <RecentAttendanceTable />
      <QuickActionsPanel />
    </div>
  );
}
