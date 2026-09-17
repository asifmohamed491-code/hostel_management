"use client";

import { useRef } from "react";
import { Clock } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import { useWardenAttendanceStats, type CheckinItem } from "@/hooks/useWardenAttendanceStats";

export function RecentCheckins() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const { stats } = useWardenAttendanceStats();

  // Deduplicate by record id and student name, maximum 3 items, no scrollbar
  const seenIds = new Set<string>();
  const seenStudents = new Set<string>();
  const checkins: CheckinItem[] = [];
  for (const item of stats?.recentCheckins || []) {
    const studentKey = item.name.trim().toLowerCase();
    if (!seenIds.has(item.id) && !seenStudents.has(studentKey)) {
      seenIds.add(item.id);
      seenStudents.add(studentKey);
      checkins.push(item);
      if (checkins.length === 3) break;
    }
  }

  useGSAP(
    () => {
      const rows = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".checkin-item", containerRef.current)
        : [];
      const scrollerEl =
        document.getElementById("dashboard-scroll-container") || undefined;

      if (!rows.length) return;

      if (prefersReducedMotion() || hasAnimatedRef.current) {
        gsap.set(rows, { opacity: 1, x: 0, scale: 1 });
        hasAnimatedRef.current = true;
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: containerRef.current,
          scroller: scrollerEl,
          start: "top 85%",
          once: true,
        },
        onComplete: () => {
          hasAnimatedRef.current = true;
        },
      });

      // Step-by-Step Sequential Animation for Each User Row (Runs once on mount)
      tl.fromTo(
        rows,
        {
          opacity: 0,
          x: -25,
          scale: 0.95,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
        }
      );
    },
    { scope: containerRef, dependencies: [checkins.length] }
  );

  return (
    <DashboardCard
      title="Recent Check-ins"
      className="sa-dashboard-card sa-dashboard-card--mist flex h-full flex-col overflow-hidden"
      bodyClassName="flex flex-1 flex-col px-4 pb-4 pt-3 sm:px-5 overflow-hidden"
    >
      <div ref={containerRef} className="flex flex-1 flex-col justify-between">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          <span>Student Name</span>
          <span>Check-in</span>
        </div>

        {/* Check-ins List - Exactly <= 3 items visible, no scrollbar */}
        {checkins.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-6 text-center text-slate-400">
            <Clock className="h-7 w-7 stroke-1 text-slate-300 mb-1" />
            <p className="text-xs font-semibold text-slate-500">No recent check-ins</p>
            <p className="text-[11px] text-slate-400">Check-ins will appear here as students mark attendance</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center gap-2 py-1">
            {checkins.map((item) => (
              <div
                key={item.id}
                className="checkin-item group flex items-center gap-3 rounded-xl p-2 transition-all duration-200 hover:bg-slate-50/80"
              >
                {/* Avatar */}
                <InitialsAvatar initials={item.initials} size={36} />

                {/* Student Details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-800 transition-colors group-hover:text-primary">
                    {item.name}
                  </p>
                  <p className="truncate text-[11px] font-medium text-slate-400">
                    {item.room}
                  </p>
                </div>

                {/* Time Pill */}
                <span className="shrink-0 rounded-full border border-slate-100 bg-slate-50/80 px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-2xs group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}