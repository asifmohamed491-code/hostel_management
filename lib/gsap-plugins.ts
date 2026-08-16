// gsap-plugins.ts
//
// Single shared place to register GSAP plugins used across the app
// (useGSAP for React lifecycle-safe animations, ScrollTrigger for
// viewport-based entrance animations on the dashboards). GSAP's
// registerPlugin is idempotent, but centralizing it here means every
// animated component imports gsap/useGSAP/ScrollTrigger from one spot
// instead of re-registering ScrollTrigger in a dozen files.
"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * True when the user has requested reduced motion at the OS/browser
 * level. Dashboard entrance animations check this and, when true,
 * skip straight to the animation's end state (content is still shown
 * immediately, just without the transform/opacity transition).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ---------------------------------------------------------------------
// ScrollTrigger reliability fix
// ---------------------------------------------------------------------
// Root cause of dashboard sections staying white/blank (or animating
// only after a long delay) on scroll: ScrollTrigger measures each
// trigger's start/end position against the DOM the moment it's
// created. In this app that happens the instant a card mounts, which
// is often BEFORE web fonts finish swapping in and before
// client-only data (e.g. useCurrentUser()) finishes rendering — both
// of which change layout height after the trigger has already
// "locked in" its numbers. When that happens, the real scroll
// position at which a card enters the viewport no longer matches
// what ScrollTrigger calculated, so the reveal tween's play condition
// is never satisfied and the card (which fromTo already rendered at
// opacity:0) is stuck invisible.
//
// The fix is the standard GSAP-recommended one: re-measure every
// registered ScrollTrigger once the page's async layout shifts are
// done, via ScrollTrigger.refresh(). This is registered once, here,
// so every dashboard component that creates a scrollTrigger-driven
// tween (Warden and Student alike) benefits without each component
// re-implementing it.
if (typeof window !== "undefined") {
  let refreshScheduled = false;
  const scheduleRefresh = () => {
    if (refreshScheduled) return;
    refreshScheduled = true;
    // rAF (not setTimeout) so this runs after the browser's next
    // paint/layout pass, i.e. once React has actually committed and
    // the DOM has its final size for this tick.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      refreshScheduled = false;
    });
  };

  // Fonts finishing their swap is the most common source of a late
  // layout shift on first load.
  if ("fonts" in document) {
    document.fonts.ready.then(scheduleRefresh).catch(() => {});
  }

  // Covers images and any other late-loading resource.
  window.addEventListener("load", scheduleRefresh);

  // Covers viewport/orientation changes and dashboard content that
  // resizes after client-only data arrives (e.g. sidebar/topbar
  // swapping in the real user's name).
  window.addEventListener("resize", scheduleRefresh);
}

export { gsap, useGSAP, ScrollTrigger };