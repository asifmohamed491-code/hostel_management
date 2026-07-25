// useAmbientFloat.ts
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Applies a continuous, premium-feel float to every element matching
 * `[data-float]` inside the returned container ref, and a slow
 * zoom/yoyo breathing effect to `[data-zoom]`.
 *
 * Each floater gets its own tween, tracked in a Map that is private
 * to this hook's closure (never stashed on the DOM node itself).
 * Hovering a card looks up ONLY that card's tween by element identity
 * and calls .pause() / .resume() on it — every other card's tween is
 * a completely separate gsap.core.Tween instance and is never touched.
 *
 * ONLY `y` is ever animated here. top/left/right are never written.
 */
export function useAmbientFloat<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const cleanupFns: Array<() => void> = [];

      // Private per-hook-instance map: element -> its own tween.
      // Nothing outside this closure can read or mutate it, so no
      // event handler can ever accidentally reach a different card's
      // tween.
      const floatTweens = new Map<HTMLElement, gsap.core.Tween>();

      const floaters = container.querySelectorAll<HTMLElement>("[data-float]");

      floaters.forEach((el) => {
        const distance = Number(el.dataset.floatDistance ?? 8);
        const duration = Number(el.dataset.floatDuration ?? 4);
        const delay = Number(el.dataset.floatDelay ?? 0);
        const half = distance / 2;

        // Start each card at the top of its own arc (-half), animate
        // only `y` between -half and +half, forever.
        gsap.set(el, { y: -half, force3D: true });

        const tween = gsap.to(el, {
          y: half,
          duration,
          delay,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          force3D: true,
          overwrite: "auto",
        });

        // Desync starting phase so cards never move in lockstep, even
        // when duration/delay happen to coincide.
        tween.progress(gsap.utils.random(0, 1));

        floatTweens.set(el, tween);

        // Closures here capture `tween` (this element's own instance)
        // by lexical scope, not by any shared/global reference — each
        // iteration of forEach gets its own `tween` binding.
        const handlePointerEnter = () => {
          tween.pause(); // freezes at current progress, no snap
        };
        const handlePointerLeave = () => {
          tween.resume(); // continues from paused progress, no restart
        };

        el.addEventListener("pointerenter", handlePointerEnter);
        el.addEventListener("pointerleave", handlePointerLeave);

        cleanupFns.push(() => {
          el.removeEventListener("pointerenter", handlePointerEnter);
          el.removeEventListener("pointerleave", handlePointerLeave);
          tween.kill();
          floatTweens.delete(el);
        });
      });

      const zoomTargets = container.querySelectorAll<HTMLElement>("[data-zoom]");
      zoomTargets.forEach((el) => {
        gsap.to(el, {
          scale: 1.03,
          duration: 10,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          force3D: true,
        });
      });

      return () => {
        cleanupFns.forEach((fn) => fn());
      };
    },
    { scope: containerRef }
  );

  return containerRef;
}