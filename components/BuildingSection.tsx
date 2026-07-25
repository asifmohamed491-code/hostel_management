"use client";

import Image from "next/image";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { useAmbientFloat } from "@/hooks/useAmbientFloat";
import { FloatingCards } from "@/components/FloatingCards";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

interface BuildingSectionProps {
  className?: string;
}

export function BuildingSection({ className }: BuildingSectionProps) {
  const parallaxRef = useMouseParallax<HTMLDivElement>({ strength: 14 });
  const floatRef = useAmbientFloat<HTMLDivElement>();

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-[#f6f2fe] via-[#efe7fc] to-[#f9f6ff]",
        className
      )}
    >
      <div
        ref={(node) => {
          parallaxRef.current = node;
          floatRef.current = node;
        }}
        className="relative flex h-full w-full flex-col"
      >
        {/* Top Logo */}
        <div className="absolute left-3 top-3 z-20" data-depth="0.4" data-entrance="logo">
          <Logo variant="mark" />
        </div>

        {/* Background Image - Takes 100% Height */}
        <div
          data-depth="0.8"
          data-zoom
          data-entrance="building"
          className="absolute inset-0 h-full w-full z-0"
        >
          <Image
            src="/assets/images/building.png"
            alt="OASYS Institute of Technology campus building"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-[50%_19%] h-full w-full"
          />
        </div>

        {/* Optional Floating Cards */}
        <FloatingCards />

        {/* Bottom Logo Section - Positioned at the bottom over the image */}
        <div
          className="mt-auto relative z-20 flex flex-col items-center gap-1 pb-10 pt-4"
          data-depth="0.3"
          data-entrance="footer"
        >
          <Logo variant="full" size="lg" />
        </div>
      </div>
    </div>
  );
}