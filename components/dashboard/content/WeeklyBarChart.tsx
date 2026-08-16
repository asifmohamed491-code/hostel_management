"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { WEEKLY_ATTENDANCE } from "@/lib/dashboard-mock";

export function WeeklyBarChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBar, setHoveredBar] = useState<{
    label: string;
    value: number;
  } | null>(null);

  useGSAP(
    () => {
      const bars = gsap.utils.toArray<HTMLElement>(".chart-bar-fill");
      if (!bars.length) return;

      if (prefersReducedMotion()) {
        bars.forEach((bar, index) => {
          bar.style.height = `${WEEKLY_ATTENDANCE[index]?.value || 0}%`;
        });
        return;
      }

      // Direct GSAP target Array Animation for Guaranteed Height Growth
      gsap.fromTo(
        bars,
        { height: "0%" },
        {
          height: (index) => `${WEEKLY_ATTENDANCE[index]?.value || 0}%`,
          duration: 1.2,
          stagger: 0.1,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <DashboardCard
      title="Weekly Attendance Bar Chart"
      className="flex h-full flex-col min-h-[280px]"
      bodyClassName="flex flex-1 flex-col px-3 pb-4 pt-3 sm:px-5"
    >
      <div ref={containerRef} className="flex flex-1 flex-col justify-between">
        {/* Main Chart Area */}
        <div className="relative flex min-h-[200px] flex-1 gap-2 sm:gap-3">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between py-1 text-[10px] font-semibold text-slate-400 select-none sm:text-[11.5px]">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>

          {/* Bar Chart Container */}
          <div className="relative flex flex-1 items-end justify-between gap-1.5 sm:gap-3 pt-3">
            {/* Horizontal Gridlines */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-1">
              {[0, 25, 50, 75, 100].map((val) => (
                <div
                  key={val}
                  className="w-full border-b border-dashed border-slate-100"
                />
              ))}
            </div>

            {/* Bars Column */}
            {WEEKLY_ATTENDANCE.map((point) => (
              <div
                key={point.label}
                className="group relative flex h-full flex-1 flex-col items-center justify-end z-10"
                onMouseEnter={() => setHoveredBar(point)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Outer Track Bar */}
                <div className="relative flex h-full w-full max-w-[22px] sm:max-w-[32px] items-end overflow-hidden rounded-full bg-slate-100/80 p-0.5">
                  {/* GSAP Animated Growing Bar */}
                  <div
                    className="chart-bar-fill w-full rounded-full bg-gradient-to-t from-primary via-purple-500 to-indigo-400 hover:brightness-110 hover:shadow-lg hover:shadow-primary/30"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* X-Axis Day Labels */}
        <div className="mt-3 flex pl-6 sm:pl-8 text-[10.5px] font-semibold text-slate-400 sm:text-[12px]">
          {WEEKLY_ATTENDANCE.map((point) => (
            <span
              key={point.label}
              className={`flex-1 text-center transition-all duration-200 ${
                hoveredBar?.label === point.label
                  ? "text-primary font-bold scale-110"
                  : ""
              }`}
            >
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}