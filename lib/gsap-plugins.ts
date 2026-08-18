"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

if (typeof document !== "undefined") {
  const initScrollTrigger = () => {
    const dashboardScrollContainer = document.getElementById(
      "dashboard-scroll-container"
    );

    if (dashboardScrollContainer) {
      ScrollTrigger.defaults({
        scroller: dashboardScrollContainer,
      });
      ScrollTrigger.refresh();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollTrigger, {
      once: true,
    });
  } else {
    initScrollTrigger();
  }
}

/**
 * True when the user has requested reduced motion
 * at the OS/browser level.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}

/**
 * Configure ScrollTrigger for the dashboard's custom
 * scroll container when it exists.
 *
 * IMPORTANT:
 * We don't call ScrollTrigger.defaults() here because this
 * module can be evaluated before the dashboard DOM exists.
 *
 * Individual triggers can use the explicit trigger element
 * without requiring a global scroller configuration.
 */
export { gsap, useGSAP, ScrollTrigger };

export default gsap;
