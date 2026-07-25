// useMouseParallax.ts
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface UseMouseParallaxOptions {
  /** How strongly the container reacts to pointer movement, in pixels. */
  strength?: number;
  /** Selector (within the container) for elements that should react more/less via data-depth. */
  itemSelector?: string;
}

/**
 * Attaches a subtle mouse-parallax effect to a container ref.
 * Elements inside the container can opt into a custom depth via
 * a `data-depth` attribute (defaults to 1).
 *
 * IMPORTANT: this hook only ever animates `x` / `y` (translateX /
 * translateY) via gsap.quickTo — it never reads or writes top, left,
 * right, width, or height, so it can never rearrange a card's base
 * position, only offset it temporarily on top of that position.
 *
 * By convention, `[data-depth]` should be the OUTER wrapper of a
 * floating card, and `[data-float]` (see useAmbientFloat) should be
 * a separate INNER element. That way parallax's transform and the
 * float animation's transform are on two different DOM nodes and
 * can never overwrite each other.
 */
export function useMouseParallax<T extends HTMLElement>({
  strength = 18,
  itemSelector = "[data-depth]",
}: UseMouseParallaxOptions = {}) {
  const containerRef = useRef<T | null>(null);

  useGSAP(
    () => {
      const node = containerRef.current;
      if (!node) return;
      const container: HTMLElement = node;

      const items = Array.from(
        container.querySelectorAll<HTMLElement>(itemSelector)
      );

      const quickSetters = items.map((item) => {
        const depth = Number(item.dataset.depth ?? 1);
        return {
          // quickTo("x") / quickTo("y") resolve to translateX/translateY
          // under the hood — top/left/right are never touched.
          x: gsap.quickTo(item, "x", {
            duration: 0.6,
            ease: "power3.out",
          }),
          y: gsap.quickTo(item, "y", {
            duration: 0.6,
            ease: "power3.out",
          }),
          depth,
        };
      });

      function handlePointerMove(event: PointerEvent) {
        const rect = container.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width - 0.5;
        const relY = (event.clientY - rect.top) / rect.height - 0.5;

        quickSetters.forEach(({ x, y, depth }) => {
          x(relX * strength * depth);
          y(relY * strength * depth);
        });
      }

      function handlePointerLeave() {
        quickSetters.forEach(({ x, y }) => {
          x(0);
          y(0);
        });
      }

      container.addEventListener("pointermove", handlePointerMove);
      container.addEventListener("pointerleave", handlePointerLeave);

      return () => {
        container.removeEventListener("pointermove", handlePointerMove);
        container.removeEventListener("pointerleave", handlePointerLeave);
      };
    },
    { scope: containerRef }
  );

  return containerRef;
}