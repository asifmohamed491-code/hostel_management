// RecentCheckins.tsx
//
// Matches Figma node 149:150 "Recent Check-ins": avatar, name, room,
// time, 3 rows. Avatars are generated initials rather than the source
// file's stock headshots (see InitialsAvatar.tsx).
import { DashboardCard } from "@/components/dashboard/content/DashboardCard";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import { RECENT_CHECKINS } from "@/lib/dashboard-mock";

export function RecentCheckins() {
  return (
    <DashboardCard
      title="Recent Check-ins"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col gap-3 px-[19px] pb-4 pt-3"
    >
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-heading/35">
        <span>Student Name</span>
        <span>Check-in</span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3.5">
        {RECENT_CHECKINS.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <InitialsAvatar initials={item.initials} size={34} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-heading">{item.name}</p>
              <p className="truncate text-[11.5px] font-medium text-heading/45">{item.room}</p>
            </div>
            <span className="shrink-0 text-[11.5px] font-medium text-heading/45">{item.time}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
