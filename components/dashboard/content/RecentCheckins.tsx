"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import { RECENT_CHECKINS } from "@/lib/dashboard-mock";

gsap.registerPlugin(useGSAP);

export function RecentCheckins() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // Step-by-Step Sequential Animation for Each User Row
      tl.fromTo(
        ".checkin-item",
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
          stagger: 0.25, // 0.25s interval — oruthar vandha apram thaan aduthavar varuvaar
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <DashboardCard
      title="Recent Check-ins"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col px-4 pb-4 pt-3 sm:px-5"
    >
      <div ref={containerRef} className="flex flex-1 flex-col justify-between">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Student Name</span>
          <span>Check-in</span>
        </div>

        {/* Check-ins List */}
        <div className="flex flex-1 flex-col justify-center gap-2 py-1">
          {RECENT_CHECKINS.map((item) => (
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
      </div>
    </DashboardCard>
  );
}