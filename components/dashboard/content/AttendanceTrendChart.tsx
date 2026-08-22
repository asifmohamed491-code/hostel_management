"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { WEEKLY_ATTENDANCE } from "@/lib/dashboard-mock";

const WIDTH = 320;
const HEIGHT = 180;
const PADDING_Y = 22; // Top/Bottom padding அதிகப்படுத்தியதால் Dots மேல ஒட்டாது
const PADDING_X = 12;

type Point = { x: number; y: number };

function buildPaths(points: Point[]) {
  if (!points || points.length === 0) return { linePath: "", areaPath: "" };

  const first = points[0];
  if (!first) return { linePath: "", areaPath: "" };

  let linePath = `M ${first.x},${first.y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    if (current && next) {
      // Curve intensity-ஐ கம்மி பண்ணி smooth-ஆக்கியுள்ளோம் (0.5 tension)
      const controlX = (current.x + next.x) / 2;
      linePath += ` C ${controlX},${current.y} ${controlX},${next.y} ${next.x},${next.y}`;
    }
  }

  const lastPoint = points[points.length - 1] || first;
  const areaPath = `${linePath} L ${lastPoint.x},${HEIGHT - PADDING_Y / 2} L ${first.x},${HEIGHT - PADDING_Y / 2} Z`;

  return { linePath, areaPath };
}

export function AttendanceTrendChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const [activePoint, setActivePoint] = useState<{ x: number; y: number; value: number; label: string } | null>(null);

  const data = WEEKLY_ATTENDANCE && WEEKLY_ATTENDANCE.length > 0 ? WEEKLY_ATTENDANCE : [];
  const usableWidth = WIDTH - PADDING_X * 2;
  const usableHeight = HEIGHT - PADDING_Y * 2;
  const step = data.length > 1 ? usableWidth / (data.length - 1) : 0;

  // Y-axis positioning with proper padding offset
  const points = data.map((point, i) => ({
    x: PADDING_X + i * step,
    y: PADDING_Y + (1 - (point?.value || 0) / 100) * usableHeight,
    value: point?.value || 0,
    label: point?.label || "",
  }));

  const { linePath, areaPath } = buildPaths(points);

  useGSAP(
    () => {
      const line = pathRef.current;
      const area = areaRef.current;
      const dots = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".chart-dot", containerRef.current)
        : [];
      const scrollerEl =
        document.getElementById("dashboard-scroll-container") || undefined;

      if (!line || !area || points.length === 0) return;

      const length = line.getTotalLength();

      if (prefersReducedMotion()) {
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: 0 });
        gsap.set(area, { opacity: 1 });
        gsap.set(dots, { scale: 1, opacity: 1 });
        return;
      }

      gsap.set(line, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
      gsap.set(area, { opacity: 0 });
      gsap.set(dots, { scale: 0, opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: containerRef.current,
          scroller: scrollerEl,
          start: "top 85%",
          once: true,
        },
      });

      tl.to(line, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: "power3.inOut",
      })
      .to(
        area,
        { opacity: 1, duration: 0.6 },
        "-=0.6"
      )
      .to(
        dots,
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "back.out(1.7)",
        },
        "-=0.4"
      );
    },
    { scope: containerRef, dependencies: [data] }
  );

  return (
    <DashboardCard
      title="Attendance Trend Chart"
      className="sa-dashboard-card sa-dashboard-card--pearl flex h-full flex-col min-h-[280px]"
      bodyClassName="sa-chart-body flex flex-1 flex-col px-4 pb-5 pt-4 sm:px-6"
    >
      <div ref={containerRef} className="relative flex flex-1 gap-3">
        {/* Y-Axis Labels with Matching Vertical Padding */}
        <div className="flex flex-col justify-between py-2 text-[10px] font-semibold text-slate-400 select-none sm:text-[11.5px]">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>

        {/* Chart SVG with Improved Margin & Breathing Space */}
        <div className="relative flex-1 min-h-[190px] pt-1">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c5cd6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#7c5cd6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Dashed Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1="0"
                y1={PADDING_Y + ratio * usableHeight}
                x2={WIDTH}
                y2={PADDING_Y + ratio * usableHeight}
                stroke="#f1f5f9"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
            ))}

            {/* Gradient Area Fill */}
            {areaPath && <path ref={areaRef} d={areaPath} fill="url(#trendFill)" />}

            {/* Smooth Trend Line */}
            {linePath && (
              <path
                ref={pathRef}
                d={linePath}
                fill="none"
                stroke="#7c5cd6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Point Dots */}
            {points.map((p, i) => (
              <g key={i} className="chart-dot cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#ffffff"
                  stroke="#7c5cd6"
                  strokeWidth="2.5"
                  className="transition-transform duration-200 hover:scale-150"
                  onMouseEnter={() => setActivePoint(p)}
                  onMouseLeave={() => setActivePoint(null)}
                />
              </g>
            ))}
          </svg>

          {/* Hover Tooltip */}
          {activePoint && (
            <div
              className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg transition-all"
              style={{
                left: `${(activePoint.x / WIDTH) * 100}%`,
              }}
            >
              {activePoint.value}%
            </div>
          )}
        </div>
      </div>

      {/* X-Axis Labels */}
      <div className="mt-3 flex pl-7 sm:pl-9 text-[10.5px] font-semibold text-slate-400 sm:text-[12px]">
        {points.map((p, index) => (
          <span key={index} className="flex-1 text-center">
            {p.label}
          </span>
        ))}
      </div>
    </DashboardCard>
  );
}