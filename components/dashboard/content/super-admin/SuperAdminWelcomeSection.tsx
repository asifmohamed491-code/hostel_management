// SuperAdminWelcomeSection.tsx
//
// Plain heading + subtext directly on the dashboard background (no
// glass card), matching the reference screenshot's "Welcome back,
// Admin 👋" section. Name is dynamic via the existing useCurrentUser()
// hook — same source the Topbar profile already reads from — and
// falls back to "Admin" (the reference screenshot's own placeholder)
// while loading or if unauthenticated, so nothing is hardcoded.
"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function SuperAdminWelcomeSection() {
  const { user, loading } = useCurrentUser();
  const firstName = user?.fullName?.trim().split(/\s+/)[0];
  const displayName = loading || !firstName ? "Admin" : firstName;

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(".sa-welcome-line", { opacity: 1, y: 0 });
        return;
      }

      const scrollerEl = document.getElementById("dashboard-scroll-container") || undefined;

      gsap.fromTo(
        ".sa-welcome-line",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            scroller: scrollerEl,
            start: "top 95%",
            once: true,
          },
        }
      );
    },
    { scope: containerRef, dependencies: [displayName] }
  );

  return (
    <div ref={containerRef}>
      <h1 className="sa-welcome-line text-[26px] font-bold leading-tight text-heading xl:text-[32px]">
        Welcome back, {displayName} 👋
      </h1>
      <p className="sa-welcome-line mt-1.5 text-[13.5px] font-medium text-heading/50 xl:text-[15px]">
        Here&apos;s your hostel system overview for today.
      </p>
    </div>
  );
}
