"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { STAT_CARDS } from "@/lib/dashboard-mock";

export function StatCardsRow() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".stat-card-item", containerRef.current)
        : [];
      const valueElements = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".stat-card-value", containerRef.current)
        : [];
      const scrollerEl =
        document.getElementById("dashboard-scroll-container") || undefined;

      if (prefersReducedMotion()) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        valueElements.forEach((el, index) => {
          el.textContent = String(STAT_CARDS[index]?.value ?? "0");
        });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: containerRef.current,
          scroller: scrollerEl,
          start: "top 85%",
          once: true,
        },
      });

      // 1. Cards Entrance Animation (Slide & Scale Up)
      tl.fromTo(
        cards,
        {
          opacity: 0,
          y: 20,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
        }
      );

      // 2. Number Count-Up Animation (0 -> Target Value)

      valueElements.forEach((el, index) => {
        const rawValue = String(STAT_CARDS[index]?.value || "0");
        // String-ல் இருந்து எண்களை மட்டும் பிரித்தெடுக்கும் (Extract numeric digits)
        const numericMatch = rawValue.match(/\d+/);
        
        if (numericMatch) {
          const targetNum = parseInt(numericMatch[0], 10);
          const prefix = rawValue.substring(0, numericMatch.index);
          const suffix = rawValue.substring((numericMatch.index || 0) + numericMatch[0].length);
          const obj = { val: 0 };

          tl.to(
            obj,
            {
              val: targetNum,
              duration: 1.2,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
              },
            },
            0.1 + index * 0.08 // Stagger delay for count-up
          );
        }
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:flex xl:gap-4.5"
    >
      {STAT_CARDS.map((card) => (
        <div
          key={card.id}
          className={
            "stat-card-item group relative flex flex-1 flex-col justify-between overflow-hidden rounded-[22px] " +
            "border border-white/60 p-4 transition-all duration-300 ease-out xl:p-5 " +
            "hover:-translate-y-1.5 hover:border-white hover:shadow-xl active:scale-[0.98]"
          }
          style={{
            backgroundImage: card.gradient,
            boxShadow: card.shadow,
          }}
        >
          {/* Subtle Glass Accent Light Overlay on Hover */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-xl transition-all duration-500 group-hover:scale-150 group-hover:bg-white/30" />

          {/* Card Label */}
          <div className="relative z-10 flex items-center justify-between">
            <p className="text-[12.5px] font-medium tracking-tight text-slate-600 transition-colors duration-200 group-hover:text-slate-800 xl:text-[13.5px]">
              {card.label}
            </p>
          </div>

          {/* Animated Card Value */}
          <div className="relative z-10 mt-2 flex items-baseline gap-1">
            <p className="stat-card-value text-2xl font-bold tracking-tight text-slate-900 transition-transform duration-300 group-hover:scale-[1.02] xl:text-[28px]">
              0
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}