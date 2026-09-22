"use client";

// StudentBottomRow.tsx
//
// The bottom 4-card row on the Student dashboard: Attendance
// Overview, My Room Details, Recent Notifications, Quick Actions.
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { RadialProgress } from "@/components/dashboard/content/RadialProgress";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import { cn } from "@/lib/cn";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import {
  STUDENT_QUICK_ACTIONS,
  type StudentQuickAction,
} from "@/lib/student-dashboard-mock";

function AttendanceOverviewCard() {
  const cardRef = useRef<HTMLElement>(null);
  const { attendance } = useStudentDashboard();

  const breakdown = [
    { label: "Present", value: attendance.present, color: "#22C55E" },
    { label: "Absent", value: attendance.absent, color: "#EF4444" },
  ];
  const maxValue = Math.max(attendance.present, attendance.absent, 1);

  useGSAP(
    () => {
      const bars = cardRef.current
        ? gsap.utils.toArray<HTMLElement>(".mini-bar-fill", cardRef.current)
        : [];
      if (!bars.length) return;

      if (prefersReducedMotion()) {
        bars.forEach((bar, index) => {
          const item = breakdown[index];
          bar.style.height = `${Math.max(((item?.value ?? 0) / maxValue) * 100, 8)}%`;
        });
        return;
      }

      const scrollerEl =
        document.getElementById("dashboard-scroll-container") || undefined;

      gsap.fromTo(
        bars,
        { height: "0%" },
        {
          height: (index) => {
            const item = breakdown[index];
            return `${Math.max(((item?.value ?? 0) / maxValue) * 100, 8)}%`;
          },
          duration: 1.2,
          stagger: 0.1,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: cardRef.current,
            scroller: scrollerEl,
            start: "top 90%",
            once: true,
          },
        }
      );
    },
    { scope: cardRef, dependencies: [attendance.present, attendance.absent] }
  );

  return (
    <DashboardCard
      ref={cardRef}
      title="Attendance Overview"
      className="sa-dashboard-card sa-dashboard-card--violet flex h-full flex-col"
      bodyClassName="sa-chart-body flex flex-1 flex-col items-center justify-center gap-4 px-4 pb-5 pt-2"
    >
      <div className="flex w-full items-center justify-center gap-5">
        <RadialProgress
          value={attendance.percentage}
          size={104}
          strokeWidth={10}
          valueClassName="text-[20px] font-bold text-heading"
        />

        <div className="flex h-[90px] items-end gap-2.5">
          {breakdown.map((item) => (
            <div key={item.label} className="flex h-full w-4 items-end rounded-full bg-heading/5 p-0.5">
              <div
                className="mini-bar-fill w-full rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {breakdown.map((item) => (
          <span
            key={item.label}
            className="flex items-center gap-1.5 text-[11.5px] font-semibold text-heading/60"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </DashboardCard>
  );
}

function MyRoomDetailsCard() {
  const cardRef = useRef<HTMLElement>(null);
  const { room } = useStudentDashboard();

  useGSAP(
    () => {
      const roommates = cardRef.current
        ? gsap.utils.toArray<HTMLElement>(".roommate-item", cardRef.current)
        : [];

      if (!roommates.length) return;

      if (prefersReducedMotion()) {
        gsap.set(roommates, { opacity: 1, x: 0, scale: 1 });
        return;
      }

      const scrollerEl =
        document.getElementById("dashboard-scroll-container") || undefined;

      gsap.fromTo(
        roommates,
        { opacity: 0, x: -25, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            scroller: scrollerEl,
            start: "top 90%",
            once: true,
          },
        }
      );
    },
    { scope: cardRef, dependencies: [room.roommates] }
  );

  return (
    <DashboardCard
      ref={cardRef}
      title="My Room Details"
      className="sa-dashboard-card sa-dashboard-card--pearl flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col gap-3 px-[19px] pb-4 pt-2"
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-heading/40">
          Floor
        </p>
        <p className="text-[14px] font-bold text-heading">{room.floor}</p>
      </div>

      <div className="min-h-0 flex-1">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-heading/40">
          Roommates
        </p>
        {room.roommates.length === 0 ? (
          <p className="py-4 text-center text-[12.5px] font-medium text-heading/40">
            No roommates assigned
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[140px] pr-1">
            {room.roommates.map((mate) => (
              <div key={mate.id} className="roommate-item flex items-center gap-2.5 rounded-xl p-1.5">
                <InitialsAvatar initials={mate.initials} size={30} />
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-heading">
                  {mate.name}
                </span>
              </div>
            ))}
          </div>
        )}
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
  const cardRef = useRef<HTMLElement>(null);
  const { notifications } = useStudentDashboard();
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  useGSAP(
    () => {
      const notificationItems = cardRef.current
        ? gsap.utils.toArray<HTMLElement>(".notification-item", cardRef.current)
        : [];

      if (!notificationItems.length) return;

      if (prefersReducedMotion()) {
        gsap.set(notificationItems, { opacity: 1, x: 0, scale: 1 });
        return;
      }

      const scrollerEl =
        document.getElementById("dashboard-scroll-container") || undefined;

      gsap.fromTo(
        notificationItems,
        { opacity: 0, x: -25, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            scroller: scrollerEl,
            start: "top 90%",
            once: true,
          },
        }
      );
    },
    { scope: cardRef, dependencies: [notifications] }
  );

  return (
    <DashboardCard
      ref={cardRef}
      title="Recent Notifications"
      className="sa-dashboard-card sa-dashboard-card--mist flex h-full flex-col overflow-hidden"
      bodyClassName="flex flex-1 flex-col overflow-hidden px-[19px] pb-3 pt-2"
    >
      {notifications.length === 0 ? (
        <p className="py-8 text-center text-[12.5px] font-medium text-heading/40">
          No notifications yet
        </p>
      ) : (
        <div
          onScroll={handleScroll}
          className={cn(
            "flex flex-1 flex-col gap-1 overflow-y-auto max-h-[220px] pr-1.5 oasys-scrollbar-autohide",
            isScrolling && "is-scrolling"
          )}
        >
          {notifications.map((note, index) => {
            const Icon = NOTIFICATION_ICON[note.type] || Bell;
            return (
              <div
                key={note.id}
                className={
                  "notification-item flex items-start gap-2.5 py-2.5" +
                  (index !== notifications.length - 1 ? " border-b border-heading/5" : "")
                }
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-heading/40">{note.date}</p>
                  <p className="text-[12.5px] font-medium leading-snug text-heading/80">
                    {note.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(".quick-action-btn", { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.fromTo(
        ".quick-action-btn",
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: containerRef.current,
            scroller: document.getElementById("dashboard-scroll-container") || undefined,
            start: "top 90%",
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  const handleQuickAction = (actionId: string) => {
    if (actionId === "mark-attendance") {
      router.push("/dashboard/student/attendance");
    }
    // Other actions can be wired up later
  };

  return (
    <DashboardCard
      title="Quick Actions"
      className="sa-dashboard-card sa-dashboard-card--lilac flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col px-3 pb-3 pt-1.5"
    >
      <div ref={containerRef} className="grid grid-cols-2 gap-2">
        {STUDENT_QUICK_ACTIONS.map((action) => {
          const Icon = QUICK_ACTION_ICONS[action.icon];
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleQuickAction(action.id)}
              className={
                "quick-action-btn sa-student-action-btn group relative flex flex-col items-center justify-center gap-1 rounded-xl " +
                "border border-slate-200/80 bg-white/80 px-2 py-2 text-center backdrop-blur-md " +
                "shadow-2xs transition-all duration-200 ease-out " +
                "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white " +
                "hover:shadow-md hover:shadow-primary/10 " +
                "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
              }
            >
              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:-translate-x-0.5 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-md group-hover:shadow-primary/30">
                <Icon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-6" />
              </span>
              <span className="text-[10.5px] font-medium leading-tight text-slate-700 group-hover:text-slate-900 line-clamp-1">
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