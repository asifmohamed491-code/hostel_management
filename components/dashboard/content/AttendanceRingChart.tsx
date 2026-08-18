"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { ATTENDANCE_RING_PCT } from "@/lib/dashboard-mock";

export function AttendanceRingChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  // Circle Dimensions
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (ATTENDANCE_RING_PCT / 100) * circumference;

  useGSAP(
    () => {
      const statusBadges = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".status-badge", containerRef.current)
        : [];
      const scrollerEl =
        document.getElementById("dashboard-scroll-container") || undefined;

      if (prefersReducedMotion()) {
        if (circleRef.current) {
          gsap.set(circleRef.current, { strokeDashoffset: targetOffset });
        }
        if (countRef.current) {
          countRef.current.textContent = `${ATTENDANCE_RING_PCT}%`;
        }
        gsap.set(statusBadges, { opacity: 1, y: 0 });
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
      });

      // 1. Circle Bar Filling Animation (0 to Target)
      if (circleRef.current) {
        tl.fromTo(
          circleRef.current,
          { strokeDashoffset: circumference },
          { strokeDashoffset: targetOffset, duration: 1.4, ease: "power3.inOut" },
          0
        );
      }

      // 2. Count-Up Animation (0% to Target %)
      if (countRef.current) {
        const obj = { value: 0 };
        tl.to(
          obj,
          {
            value: ATTENDANCE_RING_PCT,
            duration: 1.4,
            ease: "power3.inOut",
            onUpdate: () => {
              if (countRef.current) {
                countRef.current.textContent = `${Math.round(obj.value)}%`;
              }
            },
          },
          0
        );
      }

      // 3. Status Badge Slide-Up
      tl.fromTo(
        statusBadges,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.4"
      );
    },
    { scope: containerRef }
  );

  return (
    <DashboardCard
      title="Attendance Overview"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col items-center justify-center p-6"
    >
      <div ref={containerRef} className="flex flex-col items-center justify-center">
        {/* Custom SVG Ring with GSAP Animated Circle */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="-rotate-90 transform">
            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100"
              fill="transparent"
            />
            {/* Animated Front Progress Circle */}
            <circle
              ref={circleRef}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              className="text-primary transition-colors"
              fill="transparent"
            />
          </svg>

          {/* Center Text Layout - Clean & Standard Font Weight */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span
              ref={countRef}
              className="text-xl font-semibold tracking-normal text-slate-800"
            >
              0%
            </span>
            <span className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
              Present Today
            </span>
          </div>
        </div>

        {/* Minimal Status Badge */}
        <div className="status-badge mt-4 flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50/80 px-3 py-1 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-600">
            Good Standing
          </span>
        </div>
      </div>
    </DashboardCard>
  );
}