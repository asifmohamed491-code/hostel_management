// SuperAdminStatCardsRow.tsx
//
// The Super Admin dashboard's 6-card top row (Total Students / Total
// Wardens / Total Hostel Blocks / Total Rooms / Room Occupancy /
// Active Users), matching the reference screenshot. Same glass stat-
// card shell + count-up GSAP pattern as the Warden dashboard's
// StatCardsRow.tsx, extended with a leading icon and an optional
// progress bar (Room Occupancy) instead of a caption line.
"use client";

import { useRef } from "react";
import type { ComponentType, SVGProps } from "react";
import { TrendingUp, ShieldCheck, MapPinned, KeyRound, Gauge, Users2 } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { SUPER_ADMIN_STAT_CARDS, type StatCardIcon } from "@/lib/super-admin-dashboard-mock";

const ICONS: Record<StatCardIcon, ComponentType<SVGProps<SVGSVGElement>>> = {
  students: TrendingUp,
  wardens: ShieldCheck,
  blocks: MapPinned,
  rooms: KeyRound,
  occupancy: Gauge,
  activeUsers: Users2,
};

export function SuperAdminStatCardsRow() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".sa-stat-card", containerRef.current)
        : [];
      const valueElements = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".sa-stat-value", containerRef.current)
        : [];
      const bars = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".sa-stat-bar", containerRef.current)
        : [];
      const scrollerEl = document.getElementById("dashboard-scroll-container") || undefined;

      if (prefersReducedMotion()) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        valueElements.forEach((el, index) => {
          el.textContent = String(SUPER_ADMIN_STAT_CARDS[index]?.value ?? "0");
        });
        gsap.set(bars, { scaleX: 1 });
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

      tl.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.07 }
      );

      valueElements.forEach((el, index) => {
        const rawValue = String(SUPER_ADMIN_STAT_CARDS[index]?.value || "0");
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
              duration: 1.1,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
              },
            },
            0.1 + index * 0.07
          );
        }
      });

      tl.fromTo(
        bars,
        { scaleX: 0, transformOrigin: "0% 50%" },
        { scaleX: 1, duration: 1, ease: "power3.inOut" },
        0.2
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6 xl:gap-4"
    >
      {SUPER_ADMIN_STAT_CARDS.map((card) => {
        const Icon = ICONS[card.icon];
        return (
          <div
            key={card.id}
            className={
              "sa-stat-card group relative flex flex-col justify-between overflow-hidden rounded-[22px] " +
              "sa-dashboard-card sa-dashboard-card--stat border border-white/60 bg-white/70 p-4 backdrop-blur-[20px] transition-all duration-300 ease-out xl:p-5 " +
              "hover:-translate-y-1.5 hover:border-white hover:shadow-xl active:scale-[0.98]"
            }
            style={{ boxShadow: "0 4px 14px 0 rgba(120,90,200,0.07)" }}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10 blur-xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/15" />

            <div className="relative z-10 flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-heading/45 xl:text-[11.5px]">
                {card.label}
              </p>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
            </div>

            <div className="relative z-10 mt-3 flex items-baseline gap-1">
              <p className="sa-stat-value text-2xl font-bold tracking-tight text-heading xl:text-[28px]">
                0
              </p>
            </div>

            {card.progressPct !== undefined ? (
              <div className="relative z-10 mt-3 h-2 w-full overflow-hidden rounded-full bg-heading/[0.08]">
                <div
                  className="sa-stat-bar h-full rounded-full bg-primary"
                  style={{ width: `${card.progressPct}%` }}
                />
              </div>
            ) : (
              <p className="relative z-10 mt-2 text-[12px] font-medium text-heading/50">
                {card.caption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
