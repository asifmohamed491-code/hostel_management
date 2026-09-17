"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import {
  ExportExcelIcon,
  ExportPdfIcon,
  QrCodeIcon,
  QuickReportIcon,
} from "@/components/icons/QuickActionIcons";
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { QUICK_ACTIONS, type QuickActionItem } from "@/lib/dashboard-mock";
import { exportAttendanceToExcel, exportAttendanceToPdf } from "@/lib/attendance-export";

const ICONS = {
  qr: QrCodeIcon,
  report: QuickReportIcon,
  pdf: ExportPdfIcon,
  excel: ExportExcelIcon,
} as const;

function ActionCell({
  action,
  loadingAction,
  isLoading,
  onActionClick,
}: {
  action: QuickActionItem;
  loadingAction: string | null;
  isLoading: boolean;
  onActionClick: (actionId: string) => void;
}) {
  const Icon = ICONS[action.icon];
  const isLoading = loadingAction === action.id;

  const displayLabel = isLoading
    ? action.id === "qr"
      ? ["Generating", "Today's QR..."]
      : action.id === "report"
      ? ["Opening", "Attendance", "Report..."]
      : action.id === "excel"
      ? ["Exporting", "Excel..."]
      : action.id === "pdf"
      ? ["Exporting", "PDF..."]
      : action.label
    : action.label;

  return (
    <button
      type="button"
      onClick={() => onActionClick(action.id)}
      disabled={Boolean(loadingAction)}
      disabled={isLoading}
      className={
        "quick-action-btn group relative flex w-full items-center gap-2.5 sm:gap-3.5 rounded-2xl " +
        "sa-student-action-btn border border-slate-200/80 bg-white/80 p-2.5 sm:p-3.5 text-left backdrop-blur-md " +
        "shadow-xs transition-all duration-300 ease-out " +
        (loadingAction
          ? "cursor-default " +
            (isLoading ? "border-primary/40 bg-white shadow-md shadow-primary/5 " : "opacity-60 ")
        (isLoading
          ? "cursor-default border-primary/40 bg-white shadow-sm "
          : "hover:-translate-y-1 hover:border-primary/40 hover:bg-white hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98] cursor-pointer ") +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      }
    >
      {/* Subtle hover gradient background */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div
        className={
          "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 " +
          (isLoading ? "" : "group-hover:opacity-100")
        }
      />

      {/* Icon Wrapper */}
      <span className="relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-md group-hover:shadow-primary/30">
      {/* Icon Wrapper - When loading: locked to light lavender bg with purple spinner, NO group-hover overrides */}
      <span
        className={
          "relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 " +
          (isLoading
            ? "bg-primary/10 text-primary border border-primary/20 shadow-xs"
            : "bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-md group-hover:shadow-primary/30")
        }
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:rotate-6" />
        )}
      </span>

      {/* Text Label */}
      <span className="relative min-w-0 flex-1 text-[11.5px] sm:text-[13px] font-semibold leading-tight sm:leading-snug text-slate-700 transition-colors duration-200 group-hover:text-slate-900">
        {displayLabel.map((line) => (
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
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isOpeningReport, setIsOpeningReport] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

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

  const getIsLoading = (id: string) => {
    switch (id) {
      case "qr":
        return isGeneratingQR;
      case "report":
        return isOpeningReport;
      case "pdf":
        return isExportingPDF;
      case "excel":
        return isExportingExcel;
      default:
        return false;
    }
  };

  const handleActionClick = async (actionId: string) => {
    if (loadingAction) return;

    if (actionId === "qr") {
      setLoadingAction("qr");
      router.push("/dashboard/warden/attendance");
      setTimeout(() => setLoadingAction(null), 5000);
      if (isGeneratingQR) return;
      setIsGeneratingQR(true);
      try {
        await router.push("/dashboard/warden/attendance");
      } finally {
        setTimeout(() => setIsGeneratingQR(false), 3000);
      }
      return;
    }

    if (actionId === "report") {
      setLoadingAction("report");
      router.push("/dashboard/reports/attendance");
      setTimeout(() => setLoadingAction(null), 5000);
      if (isOpeningReport) return;
      setIsOpeningReport(true);
      try {
        await router.push("/dashboard/reports/attendance");
      } finally {
        setTimeout(() => setIsOpeningReport(false), 3000);
      }
      return;
    }

    if (actionId === "pdf" || actionId === "excel") {
    if (actionId === "pdf") {
      if (isExportingPDF) return;
      setIsExportingPDF(true);
      try {
        setLoadingAction(actionId);
        const res = await fetch("/api/attendance/report", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch records for export");
        const data = await res.json();
        const records = data.records || [];

        if (actionId === "pdf") {
          exportAttendanceToPdf(data.allRecordsForExport || records, {
            selectedDate: data.date,
            formattedDate: data.formattedDate,
            summary: data.summary,
            blockSummary: data.blockSummary,
          });
        } else {
          exportAttendanceToExcel(
            data.allRecordsForExport || records,
            `OASYS-Attendance-Report-${data.date || new Date().toISOString().slice(0, 10)}.xlsx`
          );
        }
        await exportAttendanceToPdf(data.allRecordsForExport || records, {
          selectedDate: data.date,
          formattedDate: data.formattedDate,
          summary: data.summary,
          blockSummary: data.blockSummary,
        });
      } catch (err) {
        alert(err instanceof Error ? err.message : "Export failed.");
      } finally {
        setLoadingAction(null);
        setIsExportingPDF(false);
      }
      return;
    }

    if (actionId === "excel") {
      if (isExportingExcel) return;
      setIsExportingExcel(true);
      try {
        const res = await fetch("/api/attendance/report", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch records for export");
        const data = await res.json();
        const records = data.records || [];

        exportAttendanceToExcel(
          data.allRecordsForExport || records,
          `OASYS-Attendance-Report-${data.date || new Date().toISOString().slice(0, 10)}.xlsx`
        );
      } catch (err) {
        alert(err instanceof Error ? err.message : "Export failed.");
      } finally {
        setIsExportingExcel(false);
      }
      return;
    }
  };

  return (
    <DashboardCard
      title="Quick Actions"
      className="sa-dashboard-card sa-dashboard-card--lilac flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col px-3.5 pb-4 pt-3 sm:px-5 sm:pb-5"
    >
      <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
        {QUICK_ACTIONS.map((action) => (
          <ActionCell
            key={action.id}
            action={action}
            loadingAction={loadingAction}
            isLoading={getIsLoading(action.id)}
            onActionClick={handleActionClick}
          />
        ))}
      </div>
    </DashboardCard>
  );
}
