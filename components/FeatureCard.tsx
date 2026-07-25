// FeatureCard.tsx
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { FeatureCardData } from "@/types/auth";

interface FeatureCardProps {
  card: FeatureCardData;
}

const CARD_POSITIONS: Record <
  string,
  {
    top: string;
    left?: string;
    right?: string;
  }
> = {
  attendance: { top: "24%", left: "10%" },
  "room-allocation": { top: "25%", right: "10%" },
  "fee-tracking": { top: "45%", left: "28%" },
  complaints: { top: "60%", right: "8%" },
};

const DEPTH_MAP: Record<string, number> = {
  attendance: 0.9,
  "room-allocation": 1.15,
  "fee-tracking": 1.0,
  complaints: 1.25,
};

export function FeatureCard({ card }: FeatureCardProps) {
  const position = CARD_POSITIONS[card.id] ?? {
    top: "40%",
    left: "10%",
  };

  const depth = DEPTH_MAP[card.id] ?? 1.1;

  return (
    // OUTER — parallax target only ([data-depth]). Positioning + hit area
    // live here. This element's transform is owned exclusively by
    // useMouseParallax's quickTo(x) / quickTo(y).
    <div
      data-depth={depth}
      data-entrance="floating-card"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        right: position.right,
        pointerEvents: "auto",
      }}
      className="absolute z-30"
    >
      {/* INNER — float target only ([data-float]). This element's
          transform is owned exclusively by useAmbientFloat's per-card
          tween. Nesting keeps the two animations from ever touching
          the same transform property on the same node. */}
      <div
        data-float
        data-float-duration={card.floatDuration}
        data-float-delay={card.floatDelay}
        data-float-distance={card.floatDistance}
        style={{ willChange: "transform" }}
        className="liquid-glass group flex items-center gap-2 whitespace-nowrap rounded-[20px] px-5 py-5 transition-shadow duration-300 hover:shadow-glass-lg cursor-pointer"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[-60%] w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 group-hover:animate-shine group-hover:opacity-100"
        />

        <Image
          src={card.iconSrc}
          alt=""
          width={18}
          height={18}
          className="relative z-10 shrink-0"
          aria-hidden
        />

        <span className="relative z-10 text-sm font-semibold text-heading">
          {card.label}
        </span>

        <ChevronRight size={16} className="relative z-10 text-heading/60" />
      </div>
    </div>
  );
}