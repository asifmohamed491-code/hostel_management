"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import {
  ExportExcelIcon,
  ExportPdfIcon,
  QrCodeIcon,
  QuickReportIcon,
} from "@/components/icons/QuickActionIcons";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { QUICK_ACTIONS, type QuickActionItem } from "@/lib/dashboard-mock";

const ICONS = {
  qr: QrCodeIcon,
  report: QuickReportIcon,
  pdf: ExportPdfIcon,
  excel: ExportExcelIcon,
} as const;

function ActionCell({ action }: { action: QuickActionItem }) {
  const Icon = ICONS[action.icon];

  return (
    <button
      type="button"
      className={
        "quick-action-btn group relative flex w-full items-center gap-2.5 sm:gap-3.5 rounded-2xl " +
        "sa-student-action-btn border border-slate-200/80 bg-white/80 p-2.5 sm:p-3.5 text-left backdrop-blur-md " +
        "shadow-xs transition-all duration-300 ease-out " +
        "hover:-translate-y-1 hover:border-primary/40 hover:bg-white " +
        "hover:shadow-lg hover:shadow-primary/10 " +
        "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      }
    >
      {/* Subtle hover gradient background */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Icon Wrapper (Responsive sizing) */}
      <span className="relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-md group-hover:shadow-primary/30">
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:rotate-6" />
      </span>

      {/* Text Label (Prevent clipping with responsive sizes & break-words) */}
      <span className="relative min-w-0 flex-1 text-[11.5px] sm:text-[13px] font-semibold leading-tight sm:leading-snug text-slate-700 transition-colors duration-200 group-hover:text-slate-900">
        {action.label.map((line) => (
          <span key={line} className="block truncate sm:whitespace-normal">
            {line}
          </span>
        ))}
      </span>
    </button>
  );
}

export function QuickActionsPanel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const buttons = containerRef.current
        ? gsap.utils.toArray<HTMLElement>(".quick-action-btn", containerRef.current)
        : [];
      const scrollerEl =
        document.getElementById("dashboard-scroll-container") || undefined;

      if (prefersReducedMotion()) {
        gsap.set(buttons, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      // Staggered Pop-In Animation for 4 Action Buttons
      gsap.fromTo(
        buttons,
        {
          opacity: 0,
          y: 20,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: containerRef.current,
            scroller: scrollerEl,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <DashboardCard
      title="Quick Actions"
      className="sa-dashboard-card sa-dashboard-card--lilac flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col px-3.5 pb-4 pt-3 sm:px-5 sm:pb-5"
    >
      {/* Grid structure handles small screens cleanly without overflowing */}
      <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
        {QUICK_ACTIONS.map((action) => (
          <ActionCell key={action.id} action={action} />
        ))}
      </div>
    </DashboardCard>
  );
}