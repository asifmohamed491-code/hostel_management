"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function getDashboardScrollContainer(): HTMLElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.getElementById("dashboard-scroll-container") as HTMLElement | null;
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

export { gsap, useGSAP, ScrollTrigger };

export default gsap;
