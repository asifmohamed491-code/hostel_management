// useEntranceTimeline.ts
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Plays a single orchestrated entrance timeline across every element
 * inside the container ref that carries a `data-entrance` attribute.
 * Order is driven by the DOM order of matching elements, which mirrors
 * the required sequence: logo -> building -> floating cards -> title ->
 * subtitle -> card -> inputs -> buttons -> footer.
 */
export function useEntranceTimeline<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const logo = container.querySelectorAll<HTMLElement>('[data-entrance="logo"]');
      const building = container.querySelectorAll<HTMLElement>('[data-entrance="building"]');
      const cards = container.querySelectorAll<HTMLElement>('[data-entrance="floating-card"]');
      const title = container.querySelectorAll<HTMLElement>('[data-entrance="title"]');
      const subtitle = container.querySelectorAll<HTMLElement>('[data-entrance="subtitle"]');
      const authCard = container.querySelectorAll<HTMLElement>('[data-entrance="auth-card"]');
      const inputs = container.querySelectorAll<HTMLElement>('[data-entrance="input"]');
      const buttons = container.querySelectorAll<HTMLElement>('[data-entrance="button"]');
      const footer = container.querySelectorAll<HTMLElement>('[data-entrance="footer"]');

      

      const allTargets = [
        logo,
        building,
        cards,
        title,
        subtitle,
        authCard,
        inputs,
        buttons,
        footer,
      ];

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          // Release GSAP's inline styles once the entrance is done so
          // hover/interaction tweens (e.g. the login button) fully own
          // their elements afterwards, instead of fighting leftover
          // inline opacity/transform values.
          gsap.set(allTargets, { clearProps: "opacity,transform" });
        },
      });

      if (logo.length) {
        timeline.from(logo, { opacity: 0, y: -16, duration: 0.6 }, 0);
      }
      if (building.length) {
        timeline.from(
          building,
          { opacity: 0, scale: 1.06, duration: 1 },
          logo.length ? 0.15 : 0
        );
      }
      if (authCard.length) {
        timeline.from(
          authCard,
          { opacity: 0, x: 40, duration: 0.7 },
          building.length ? 0.3 : 0
        );
      }
      if (cards.length) {
        timeline.from(
          cards,
          { opacity: 0, y: 24, scale: 0.9, duration: 0.6, stagger: 0.12 },
          "-=0.5"
        );
      }
      if (title.length) {
        timeline.from(title, { opacity: 0, y: 16, duration: 0.5 }, "-=0.3");
      }
      if (subtitle.length) {
        timeline.from(subtitle, { opacity: 0, y: 12, duration: 0.45 }, "-=0.25");
      }
      if (inputs.length) {
        timeline.from(
          inputs,
          { opacity: 0, y: 14, duration: 0.45, stagger: 0.1 },
          "-=0.2"
        );
      }
      if (buttons.length) {
        timeline.from(
          buttons,
          { opacity: 0, y: 12, duration: 0.4, stagger: 0.08 },
          "-=0.15"
        );
      }
      if (footer.length) {
        timeline.from(footer, { opacity: 0, y: 10, duration: 0.4 }, "-=0.1");
      }
    },
    { scope: containerRef }
  );

  return containerRef;
}