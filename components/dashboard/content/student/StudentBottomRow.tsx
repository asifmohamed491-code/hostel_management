// StudentBottomRow.tsx
//
// The bottom 4-card row on the Student dashboard: Attendance Overview,
// My Room Details, Recent Notifications, Quick Actions. Built from the
// same DashboardCard shell, RadialProgress ring, and InitialsAvatar
// already used by the Warden dashboard (see ChartsRow.tsx /
// BottomRow.tsx) so the design system is shared, not re-implemented.
import {
  Bell,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  Home,
  MessageSquareText,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { RadialProgress } from "@/components/dashboard/content/RadialProgress";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import {
  ATTENDANCE_OVERVIEW_BREAKDOWN,
  MY_ROOM_DETAILS,
  RECENT_NOTIFICATIONS,
  STUDENT_ATTENDANCE,
  STUDENT_QUICK_ACTIONS,
  type StudentQuickAction,
} from "@/lib/student-dashboard-mock";

function AttendanceOverviewCard() {
  const maxValue = Math.max(...ATTENDANCE_OVERVIEW_BREAKDOWN.map((b) => b.value));

  return (
    <DashboardCard
      title="Attendance Overview"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col items-center justify-center gap-4 px-4 pb-5 pt-2"
    >
      <div className="flex w-full items-center justify-center gap-5">
        <RadialProgress value={STUDENT_ATTENDANCE.percentage} size={104} strokeWidth={10}>
          <span className="text-[20px] font-bold text-heading">
            {STUDENT_ATTENDANCE.percentage}%
          </span>
        </RadialProgress>

        {/* Compact mini bar chart — same visual language as
            WeeklyBarChart.tsx (rounded track + filled bar) scaled down
            for three categories instead of a week of days. */}
        <div className="flex h-[90px] items-end gap-2">
          {ATTENDANCE_OVERVIEW_BREAKDOWN.map((item) => (
            <div key={item.label} className="flex h-full w-4 items-end rounded-full bg-heading/5 p-0.5">
              <div
                className="w-full rounded-full"
                style={{
                  height: `${Math.max((item.value / maxValue) * 100, 8)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {ATTENDANCE_OVERVIEW_BREAKDOWN.map((item) => (
          <span
            key={item.label}
            className="flex items-center gap-1.5 text-[11.5px] font-semibold text-heading/60"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
            {item.label === "Late" ? `: ${item.value}` : ""}
          </span>
        ))}
      </div>
    </DashboardCard>
  );
}

function MyRoomDetailsCard() {
  return (
    <DashboardCard
      title="My Room Details"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col gap-3 px-[19px] pb-4 pt-2"
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-heading/40">
          Floor
        </p>
        <p className="text-[14px] font-bold text-heading">{MY_ROOM_DETAILS.floor}</p>
      </div>

      <div className="min-h-0 flex-1">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-heading/40">
          Roommates
        </p>
        <div className="flex flex-col gap-1.5 overflow-y-auto">
          {MY_ROOM_DETAILS.roommates.map((mate) => (
            <div key={mate.id} className="flex items-center gap-2.5 rounded-xl p-1.5">
              <InitialsAvatar initials={mate.initials} size={30} />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-heading">
                {mate.name}
              </span>
              <span className="shrink-0 rounded-full border border-heading/10 bg-heading/5 px-2 py-0.5 text-[10.5px] font-semibold text-heading/60">
                {mate.bed}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

const NOTIFICATION_ICON = {
  alert: Bell,
  event: CalendarClock,
  reminder: CheckCircle2,
} as const;

function RecentNotificationsCard() {
  return (
    <DashboardCard
      title="Recent Notifications"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col gap-1 overflow-y-auto px-[19px] pb-3 pt-2"
    >
      {RECENT_NOTIFICATIONS.map((note, index) => {
        const Icon = NOTIFICATION_ICON[note.type];
        return (
          <div
            key={note.id}
            className={
              "flex items-start gap-2.5 py-2.5" +
              (index !== RECENT_NOTIFICATIONS.length - 1 ? " border-b border-heading/5" : "")
            }
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-heading/40">{note.date}</p>
              <p className="text-[12.5px] font-medium leading-snug text-heading/80">
                {note.message}
              </p>
            </div>
          </div>
        );
      })}
    </DashboardCard>
  );
}

const QUICK_ACTION_ICONS: Record<StudentQuickAction["icon"], typeof Home> = {
  room: Home,
  attendance: CheckCircle2,
  food: UtensilsCrossed,
  maintenance: Wrench,
  feedback: MessageSquareText,
  rules: BookOpenCheck,
};

function StudentQuickActionsCard() {
  return (
    <DashboardCard
      title="Quick Actions"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col px-3.5 pb-4 pt-2 sm:px-4"
    >
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {STUDENT_QUICK_ACTIONS.map((action) => {
          const Icon = QUICK_ACTION_ICONS[action.icon];
          return (
            <button
              key={action.id}
              type="button"
              className={
                "group relative flex flex-col items-center gap-2 rounded-2xl " +
                "border border-slate-200/80 bg-white/80 p-3 text-center backdrop-blur-md " +
                "shadow-xs transition-all duration-300 ease-out " +
                "hover:-translate-y-1 hover:border-primary/40 hover:bg-white " +
                "hover:shadow-lg hover:shadow-primary/10 " +
                "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              }
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[11.5px] font-semibold leading-tight text-slate-700 group-hover:text-slate-900">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </DashboardCard>
  );
}

export function StudentBottomRow() {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4.5">
      <AttendanceOverviewCard />
      <MyRoomDetailsCard />
      <RecentNotificationsCard />
      <StudentQuickActionsCard />
    </div>
  );
}