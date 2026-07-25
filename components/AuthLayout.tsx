// AuthLayout.tsx
"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { BuildingSection } from "@/components/BuildingSection";
import { useEntranceTimeline } from "@/hooks/useEntranceTimeline";
import { cn } from "@/lib/cn";
import type { AuthIllustrationSide } from "@/types/auth";

interface AuthLayoutProps extends AuthIllustrationSide {
  children: ReactNode;
}

export function AuthLayout({ cardSide, children }: AuthLayoutProps) {
  const timelineRef = useEntranceTimeline<HTMLDivElement>();

  return (
    <main
      ref={timelineRef}
      className="relative flex h-screen w-screen bg-lavender lg:flex-row"
    >
      <div
        className={cn(
          "relative hidden h-full w-1/2 lg:block",
          cardSide === "left" ? "order-2" : "order-1"
        )}
      >
        <BuildingSection />
      </div>

      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center overflow-y-hidden px-6 py-10 sm:px-10 lg:w-1/2",
          cardSide === "left" ? "order-1" : "order-2"
        )}
      >
        {/* Layer 0 — background image, always the floor */}
        <Image
          src="/assets/images/page-background.png"
          alt=""
          fill
          priority
          sizes="50vw"
          aria-hidden
          className="absolute inset-0 z-0 object-cover object-center"
        />

        {/* Layer 1 — subtle tint only, never opaque, keeps contrast without hiding the image */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/5 via-transparent to-black/15" />

        {/* Layer 2 — content, always on top */}
        <div className="relative z-10 flex w-full justify-center">
          {children}
        </div>
      </div>
    </main>
  );
}