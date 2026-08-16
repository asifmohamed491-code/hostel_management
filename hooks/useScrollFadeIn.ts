// useScrollFadeIn.ts
"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap-plugins";

interface ScrollFadeInOptions {
  /** Selector (relative to the container) for the elements to stagger in. Defaults to direct children. */
  selector?: string;
  y?: number;
  duration?: number;
  stagger?: number;
  /** ScrollTrigger "start" value — how close to the viewport before animating. */
  start?: string;
}

/**
 * Generic viewport-aware entrance animation: fades + slides a group of
 * child elements in (opacity/transform only) once the container enters
 * the viewport. If the container is already on-screen when the page
 * loads (e.g. it's the first thing above the fold), ScrollTrigger fires
 * immediately — so this one hook naturally covers both the "animate
 * what's visible on load" and "animate on scroll" requirements without
 * separate code paths. `once: true` means it never replays on
 * scroll-up/scroll-down after the first run.
 */
export function useScrollFadeIn<T extends HTMLElement>({
  selector = ":scope > *",
  y = 24,
  duration = 0.6,
  stagger = 0.08,
  start = "top 85%",
}: ScrollFadeInOptions = {}) {
  const containerRef = useRef<T | null>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const targets = container.querySelectorAll<HTMLElement>(selector);
      if (!targets.length) return;

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: container,
            start,
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return containerRef;
}