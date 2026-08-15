// StudentSummaryRow.tsx
//
// The 4-card summary row directly under the Welcome Card on the
// Student dashboard: My Room, Attendance, Today's Food, Maintenance
// Requests. Reuses the same DashboardCard shell and RadialProgress
// ring already used by the Warden dashboard, so the visual language
// (radius, blur, border, shadow, purple accent) matches exactly.
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { RadialProgress } from "@/components/dashboard/content/RadialProgress";
import {
  MAINTENANCE_REQUESTS,
  MY_ROOM,
  STUDENT_ATTENDANCE,
  TODAYS_FOOD,
} from "@/lib/student-dashboard-mock";

function MyRoomCard() {
  return (
    <DashboardCard
      title="My Room"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 items-center justify-between gap-3 px-[19px] pb-5 pt-3"
    >
      <dl className="flex flex-col gap-2.5">
        <div>
          <dt className="text-[12px] font-medium text-heading/50">Block</dt>
          <dd className="text-[17px] font-bold text-heading">{MY_ROOM.block}</dd>
        </div>
        <div>
          <dt className="text-[12px] font-medium text-heading/50">Room</dt>
          <dd className="text-[17px] font-bold text-heading">{MY_ROOM.room}</dd>
        </div>
        <div>
          <dt className="text-[12px] font-medium text-heading/50">Bed</dt>
          <dd className="text-[17px] font-bold text-heading">
            {MY_ROOM.bedOccupied} / {MY_ROOM.bedTotal}
          </dd>
        </div>
      </dl>

      {/* Simple flat room illustration — no matching asset exists in
          public/assets, so this is a small self-contained SVG built
          from the same purple palette rather than a photo/stock
          illustration. */}
      <svg
        viewBox="0 0 96 96"
        className="h-[84px] w-[84px] shrink-0 xl:h-[96px] xl:w-[96px]"
        aria-hidden="true"
      >
        <rect x="6" y="30" width="84" height="56" rx="8" fill="#EDE6FD" />
        <rect x="6" y="30" width="84" height="10" rx="4" fill="#D9CCFA" />
        <rect x="16" y="46" width="30" height="30" rx="4" fill="#FFFFFF" stroke="#C9B8F5" strokeWidth="1.5" />
        <rect x="16" y="46" width="30" height="8" rx="3" fill="#B79CF0" />
        <circle cx="24" cy="42" r="3.5" fill="#8B5CF6" />
        <rect x="54" y="52" width="26" height="24" rx="3" fill="#FFFFFF" stroke="#C9B8F5" strokeWidth="1.5" />
        <rect x="58" y="56" width="18" height="4" rx="1.5" fill="#D9CCFA" />
        <rect x="58" y="63" width="12" height="4" rx="1.5" fill="#D9CCFA" />
        <rect x="42" y="10" width="14" height="18" rx="2" fill="#C9B8F5" opacity="0.6" />
      </svg>
    </DashboardCard>
  );
}

function AttendanceCard() {
  return (
    <DashboardCard
      title="Attendance"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col items-center justify-center gap-3 px-[19px] pb-5 pt-2"
    >
      <RadialProgress value={STUDENT_ATTENDANCE.percentage} size={110} strokeWidth={10}>
        <span className="text-[22px] font-bold text-heading">
          {STUDENT_ATTENDANCE.percentage}%
        </span>
      </RadialProgress>

      <p className="text-center text-[12.5px] font-semibold text-heading/70">
        {STUDENT_ATTENDANCE.stats.map((stat, index) => (
          <span key={stat.label}>
            {index > 0 && " | "}
            {stat.label}: <span className="text-heading">{stat.value}</span>
          </span>
        ))}
      </p>
    </DashboardCard>
  );
}

const FOOD_STATUS_ICON: Record<
  (typeof TODAYS_FOOD)[number]["status"],
  typeof CheckCircle2
> = {
  done: CheckCircle2,
  current: Clock,
  upcoming: Circle,
};

function TodaysFoodCard() {
  return (
    <DashboardCard
      title="Today's Food"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col gap-0 px-[19px] pb-4 pt-2"
    >
      {TODAYS_FOOD.map((item, index) => {
        const Icon = FOOD_STATUS_ICON[item.status];
        const isLast = index === TODAYS_FOOD.length - 1;

        return (
          <div key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Timeline rail */}
            <div className="flex flex-col items-center">
              <Icon
                className={
                  "h-4 w-4 shrink-0 " +
                  (item.status === "done"
                    ? "text-emerald-500"
                    : item.status === "current"
                      ? "text-primary"
                      : "text-heading/30")
                }
              />
              {!isLast && <span className="mt-1 w-px flex-1 bg-heading/10" />}
            </div>

            <div className="min-w-0 pb-1">
              <p className="text-[13.5px] font-semibold text-heading">
                {item.meal}: {item.menu}
              </p>
              <p className="text-[11.5px] font-medium text-heading/50">{item.time}</p>
            </div>
          </div>
        );
      })}
    </DashboardCard>
  );
}

function MaintenanceRequestsCard() {
  return (
    <DashboardCard
      title="Maintenance Requests"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col justify-between gap-4 px-[19px] pb-5 pt-3"
    >
      <dl className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <dt className="text-[13px] font-medium text-heading/60">Open</dt>
          <dd className="text-[17px] font-bold text-heading">
            {MAINTENANCE_REQUESTS.open}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[13px] font-medium text-heading/60">Resolved</dt>
          <dd className="text-[17px] font-bold text-heading">
            {MAINTENANCE_REQUESTS.resolved}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        className="w-full rounded-2xl bg-gradient-to-r from-indigo-700 to-primary-light py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(110,66,245,0.22)] transition-opacity hover:opacity-90"
      >
        New Request
      </button>
    </DashboardCard>
  );
}

export function StudentSummaryRow() {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4.5">
      <MyRoomCard />
      <AttendanceCard />
      <TodaysFoodCard />
      <MaintenanceRequestsCard />
    </div>
  );
}