// RadialProgress.tsx
//
// Hand-built circular progress ring (SVG stroke-dasharray), no chart
// library added. Used for both the small ring inside the "Today's
// Attendance" welcome card and the larger "Attendance Ring Chart" card.
import type { ReactNode } from "react";

interface RadialProgressProps {
  value: number;
  size: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  className?: string;
  children?: ReactNode;
}

export function RadialProgress({
  value,
  size,
  strokeWidth = 12,
  trackColor = "rgba(124,92,214,0.15)",
  progressColor = "#7c5cd6",
  className,
  children,
}: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;
  const center = size / 2;

  return (
    <div
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
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
