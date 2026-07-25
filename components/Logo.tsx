import Image from "next/image";
import { cn } from "@/lib/cn";

interface LogoProps {
  /** "mark" = icon only, no institute name. "full" = icon + OASYS wordmark + Institute of Technology. */
  variant?: "mark" | "full";
  size?: "sm" | "lg";
  className?: string;
}

const MARK_SIZES = {
  sm: 150,
  lg: 85,
} as const;

export function Logo({ variant = "full", size = "sm", className }: LogoProps) {
  const dimension = MARK_SIZES[size];

  if (variant === "mark") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <Image
          src="/assets/logo/oasys-mark.svg"
          alt="OASYS"
          width={dimension}
          height={dimension}
          priority
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Image
        src="/assets/logo/oasys-logo.svg"
        alt="OASYS"
        width={dimension}
        height={dimension}
        priority
      />
      <div className="flex flex-col items-center gap-1">
        <span className="text-8xl font-extrabold tracking-tight">
          <span className="text-[#F0A420]">O</span>
          <span className="bg-gradient-to-r from-primary to-heading bg-clip-text text-transparent">
            ASYS
          </span>
        </span>
        <span className="text-[25px] font-semibold text-heading">
          Hostel Management
        </span>
        <span className="text-xs font-medium text-heading/50">
          Smart Hostel Management Platform
        </span>
      </div>
    </div>
  );
}
