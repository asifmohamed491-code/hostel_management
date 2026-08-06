// ProgressOverview.tsx
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { PROGRESS, type ProgressItem } from "@/lib/dashboard-mock";

function ProgressRow({ item }: { item: ProgressItem }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold text-heading">{item.label}</p>
        <p className="text-[13px] font-bold text-heading">{item.value}%</p>
      </div>
      <p className="mt-0.5 text-[11.5px] font-medium text-heading/45">{item.caption}</p>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-heading/[0.07]">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${item.value}%`, backgroundColor: item.color }}
        />
      </div>
    </div>
  );
}

export function ProgressOverview() {
  return (
    <DashboardCard title="Progress Overview" subtitle="Monthly targets at a glance">
      <div className="flex flex-col gap-5">
        {PROGRESS.map((item) => (
          <ProgressRow key={item.id} item={item} />
        ))}
      </div>
    </DashboardCard>
  );
}
