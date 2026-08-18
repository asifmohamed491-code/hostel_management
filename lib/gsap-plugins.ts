"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let dashboardScrollerInitialized = false;

export function getDashboardScrollContainer(): HTMLElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.getElementById("dashboard-scroll-container") as HTMLElement | null;
}

export function ensureDashboardScroller(): HTMLElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  const dashboardScrollContainer = getDashboardScrollContainer();

  if (!dashboardScrollContainer) {
    return null;
  }

  ScrollTrigger.defaults({
    scroller: dashboardScrollContainer,
  });

  dashboardScrollerInitialized = true;
  ScrollTrigger.refresh();
  return dashboardScrollContainer;
}

if (typeof document !== "undefined") {
  const onDomReady = () => {
    ensureDashboardScroller();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDomReady, { once: true });
  } else {
    onDomReady();
  }

  const observer = new MutationObserver(() => {
    if (!dashboardScrollerInitialized) {
      ensureDashboardScroller();
    }
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  window.addEventListener("load", () => {
    ensureDashboardScroller();
  }, { once: true });
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
