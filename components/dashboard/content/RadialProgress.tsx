// RadialProgress.tsx
//
// Shared circular progress ring (SVG stroke-dasharray) used across
// both the Warden and Student dashboards. This is the same GSAP
// animation architecture as the Warden dashboard's hand-rolled rings
// (see WelcomeAttendanceRow.tsx's TodayAttendanceCard and
// AttendanceRingChart.tsx): the ring stroke animates from empty to
// its target via ScrollTrigger, and the numeric label counts up in
// lockstep with it (both driven by the same GSAP timeline so they
// finish together) - moved into this shared component so every
// caller (Student's Attendance card, Attendance Overview card, etc.)
// gets that exact behavior for free instead of re-implementing it,
// and so a future Warden usage of this component would match too.
"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";

interface RadialProgressProps {
  value: number;
  size: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  className?: string;
  /**
   * When set, the ring renders its own centered count-up label (same
   * "0 -> target%" behavior as AttendanceRingChart) instead of
   * relying on `children`. Pass the className that should style the
   * number (children is still available underneath for secondary
   * text, e.g. a caption line).
   */
  valueClassName?: string;
  /** Optional caption rendered under the animated number. */
  label?: string;
  children?: ReactNode;
}

export function RadialProgress({
  value,
  size,
  strokeWidth = 12,
  trackColor = "rgba(124,92,214,0.15)",
  progressColor = "#7c5cd6",
  className,
  valueClassName,
  label,
  children,
}: RadialProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (clampedValue / 100) * circumference;
  const center = size / 2;

  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        if (circleRef.current) {
          gsap.set(circleRef.current, { strokeDashoffset: targetOffset });
        }
        if (countRef.current) {
          countRef.current.textContent = `${Math.round(clampedValue)}%`;
        }
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%",
          once: true,
        },
      });

      // 1. Ring stroke fill animation (0 -> target), same timing as
      // the Warden dashboard's rings.
      if (circleRef.current) {
        tl.fromTo(
          circleRef.current,
          { strokeDashoffset: circumference },
          { strokeDashoffset: targetOffset, duration: 1.4, ease: "power3.inOut" },
          0
        );
      }

      // 2. Center percentage count-up (0% -> target%), running
      // alongside the ring so both land together.
      if (countRef.current) {
        const obj = { val: 0 };
        tl.to(
          obj,
          {
            val: clampedValue,
            duration: 1.4,
            ease: "power3.inOut",
            onUpdate: () => {
              if (countRef.current) {
                countRef.current.textContent = `${Math.round(obj.val)}%`;
              }
            },
          },
          0
        );
      }
    },
    { scope: containerRef, dependencies: [clampedValue, size, strokeWidth] }
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size, position: "relative" }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <span ref={countRef} className={valueClassName}>
            0%
          </span>
        )}
        {label && (
          <span className="mt-0.5 text-[10px] font-semibold tracking-tight text-heading/70">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}