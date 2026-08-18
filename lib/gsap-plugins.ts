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

  // Use the selector string (not a pre-queried node) so ScrollTrigger
  // resolves "#dashboard-scroll-container" lazily, at the moment each
  // trigger is actually created/refreshed - not synchronously here at
  // module-import time, when the element may not exist in the DOM yet
  // (e.g. during a first client-side navigation into the dashboard).
  ScrollTrigger.defaults({ scroller: "#dashboard-scroll-container" });

  // Refresh triggers once fonts and resources are fully settled
  if ("fonts" in document) {
    document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
  }
}

export { gsap, useGSAP, ScrollTrigger };
export default gsap;