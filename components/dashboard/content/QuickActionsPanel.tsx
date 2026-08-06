// QuickActionsPanel.tsx
//
// Matches Figma node 135:489/494/499/504 "Quick Actions": a 2x2 bento
// grid — taller top row (Generate Today's QR / View Attendance Report),
// shorter bottom row (Export PDF / Export Excel). Icons are the
// uploaded SVG pack, converted to currentColor components (see
// components/icons/QuickActionIcons.tsx).
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
  const isLarge = action.size === "lg";

  return (
    <button
      type="button"
      className={
        "group flex items-center gap-3 rounded-2xl border border-white/50 bg-white/40 px-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 " +
        (isLarge ? "h-full" : "h-full")
      }
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[#7c5cd6] transition-colors group-hover:bg-primary/15">
        <Icon className="h-[16px] w-[16px]" />
      </span>
      <span className="text-[13px] font-semibold leading-tight text-heading">
        {action.label.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </span>
    </button>
  );
}

export function QuickActionsPanel() {
  const [qr, report, pdf, excel] = QUICK_ACTIONS;

  return (
    <DashboardCard
      title="Quick Actions"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col gap-3 px-[19px] pb-[19px] pt-3"
    >
      <div className="grid flex-[1.3] grid-cols-2 gap-3">
        {qr && <ActionCell action={qr} />}
        {report && <ActionCell action={report} />}
      </div>
      <div className="grid flex-1 grid-cols-2 gap-3">
        {pdf && <ActionCell action={pdf} />}
        {excel && <ActionCell action={excel} />}
      </div>
    </DashboardCard>
  );
}
