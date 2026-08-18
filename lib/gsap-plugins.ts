// lib/gsap-plugins.ts
"use client";

import rawGsap, { gsap as namedGsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Resolve GSAP instance across ESM / Webpack / CJS bundle boundaries
const gsap = namedGsap || (rawGsap as unknown as { gsap?: typeof rawGsap })?.gsap || rawGsap;

/**
 * True when the user has requested reduced motion at the OS/browser level.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Client-side initialization
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);

  // Set default scroller only when the custom scroll container actually exists
  const container = document.getElementById("dashboard-scroll-container");
  if (container) {
    ScrollTrigger.defaults({ scroller: container });
  }

  // Refresh triggers once fonts and resources are fully settled
  if ("fonts" in document) {
    document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
  }
}

export { gsap, useGSAP, ScrollTrigger };
export default gsap;