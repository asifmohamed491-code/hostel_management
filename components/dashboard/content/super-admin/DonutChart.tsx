// DonutChart.tsx
//
// Shared two-segment donut ring for the Super Admin dashboard's
// "Student Overview" and "Hostel Occupancy" cards — same GSAP
// scroll-triggered entrance pattern as RadialProgress.tsx /
// AttendanceRingChart.tsx (fade + scale in, center value counts up),
// generalized to render two stacked SVG arcs instead of one.
"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";

export interface DonutSegment {
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerValue: string;
  centerLabel: string;
}

export function DonutChart({
  segments,
  size = 168,
  strokeWidth = 16,
  centerValue,
  centerLabel,
}: DonutChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeOffset = 0;
  const arcs = segments.map((seg) => {
    const length = (seg.value / total) * circumference;
    const arc = { ...seg, length, offset: -cumulativeOffset };
    cumulativeOffset += length;
    return arc;
  });

  // Numeric prefix/suffix split, same approach as StatCardsRow's
  // count-up (e.g. "80%" -> prefix "", digits 80, suffix "%").
  const numericMatch = centerValue.match(/\d+/);
  const prefix = numericMatch ? centerValue.slice(0, numericMatch.index ?? 0) : "";
  const suffix = numericMatch
    ? centerValue.slice((numericMatch.index ?? 0) + numericMatch[0].length)
    : "";
  const targetNum = numericMatch ? parseInt(numericMatch[0], 10) : 0;

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        if (countRef.current) countRef.current.textContent = centerValue;
        return;
      }

      const scrollerEl = document.getElementById("dashboard-scroll-container") || undefined;

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: containerRef.current,
          scroller: scrollerEl,
          start: "top 88%",
          once: true,
        },
      });

      tl.fromTo(
        ".donut-ring",
        { opacity: 0, scale: 0.85, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: 0.8 },
        0
      );

      if (countRef.current) {
        const obj = { val: 0 };
        tl.to(
          obj,
          {
            val: targetNum,
            duration: 1.1,
            ease: "power3.inOut",
            onUpdate: () => {
              if (countRef.current) {
                countRef.current.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
              }
            },
          },
          0
        );
      }

      tl.fromTo(
        ".donut-legend-row",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
        "-=0.5"
      );
    },
    { scope: containerRef, dependencies: [centerValue, total] }
  );

  return (
    <div ref={containerRef} className="flex flex-col items-center">
      <div
        className="donut-ring relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(110,66,245,0.08)"
            strokeWidth={strokeWidth}
          />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={`${arc.length} ${circumference - arc.length}`}
              strokeDashoffset={arc.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span ref={countRef} className="text-[26px] font-bold leading-tight text-heading">
            {prefersReducedMotion() ? centerValue : `${prefix}0${suffix}`}
          </span>
          <span className="mt-0.5 text-[11.5px] font-semibold text-heading/50">{centerLabel}</span>
        </div>
      </div>
    </div>
  );
}
