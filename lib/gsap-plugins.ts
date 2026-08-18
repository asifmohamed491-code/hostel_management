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

  // Point every ScrollTrigger at the dashboard's real scroll container
  // (see DashboardLayout.tsx — `<main id="dashboard-scroll-container">`
  // is the only element that actually scrolls; the outer wrapper is a
  // strict `h-screen overflow-hidden`, so `window` never scrolls).
  //
  // IMPORTANT: this is passed as a selector STRING, not a queried DOM
  // node. This used to do `document.getElementById(...)` right here
  // and hand ScrollTrigger the resulting element (or nothing, if it
  // came back null). That query ran at MODULE-EVALUATION time — i.e.
  // whenever this file's JS first executed — which is not tied to
  // React's render/commit cycle at all. In dev, slower/on-demand
  // compilation happened to let DashboardLayout mount its `<main>`
  // before this module ran. In production, the bundle is prebuilt and
  // can finish evaluating before React has committed the dashboard DOM,
  // so `getElementById` silently returned null, the default scroller
  // fell through to `window`, and — since `window` never scrolls on
  // this layout — every card's ScrollTrigger start position was never
  // reached. Cards stayed at their pre-animation state (opacity: 0,
  // empty ring, un-started count-up) forever: the white/blank-card bug.
  //
  // A selector string is resolved lazily by GSAP — via
  // `document.querySelector` — at the moment each individual
  // ScrollTrigger is actually created or refreshed (inside each card's
  // own `useGSAP` callback, which only runs after that card, and its
  // sibling `<main id="dashboard-scroll-container">`, are already in
  // the DOM together from the same React commit). That removes the
  // race entirely: no card component needs to resolve or pass its own
  // `scroller` for this to be correct.
  ScrollTrigger.defaults({ scroller: "#dashboard-scroll-container" });

  // Re-measure trigger positions once fonts have finished loading —
  // late-swapped web fonts can change text/card heights after the
  // first layout pass, which would otherwise leave ScrollTrigger's
  // start/end values stale.
  if ("fonts" in document) {
    document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
  }

  // Re-measure again once every resource on the page (images included)
  // has finished loading. Images/icons that load in after first paint
  // are the other common source of a layout shift that ScrollTrigger's
  // initial measurement wouldn't have accounted for — this is a single
  // native one-time `load` event, not a poll or an arbitrary timeout.
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

export { gsap, useGSAP, ScrollTrigger };
export default gsap;