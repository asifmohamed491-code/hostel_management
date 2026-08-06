// WelcomeAttendanceRow.tsx
//
// Matches Figma node 135:278 "Welcome + Attendance": a welcome card on
// the left and a live "Today's Attendance" card on the right, laid out
// as two roughly-equal glass panels with a 20px radius, same as source.
//
// Two copy changes vs. the raw Figma export (see lib/dashboard-mock.ts
// header comment for the attendance-stat one): the welcome subtitle in
// the source file is generic "premium SaaS" boilerplate unrelated to a
// hostel dashboard, so it's swapped for on-topic copy — the card size,
// position, and typography are unchanged.
import { RadialProgress } from "@/components/dashboard/content/RadialProgress";
import { TODAY_ATTENDANCE, TODAY_ATTENDANCE_STATS } from "@/lib/dashboard-mock";

function WelcomeCard() {
  return (
    <div
      className="flex h-full flex-1 flex-col justify-center gap-4 rounded-[20px] border border-white/40 p-6 xl:p-8"
      style={{
        backgroundImage:
          "linear-gradient(114deg, rgba(255,255,255,0.48) 58.72%, rgba(225,217,249,0.48) 131.04%)",
        backdropFilter: "blur(17.4px)",
      }}
    >
      <h1 className="text-[32px] leading-[1.15] text-heading xl:text-[44px]">
        Welcome back,
        <br />
        Warden
      </h1>
      <p className="max-w-md text-[13.5px] font-medium leading-relaxed text-heading/50 xl:text-[15px]">
        Here&apos;s today&apos;s snapshot — attendance, room occupancy, and
        open requests across the hostel.
      </p>
    </div>
  );
}

function TodayAttendanceCard() {
  return (
    <div
      className="relative h-full flex-1 overflow-hidden rounded-[20px]"
      style={{
        backgroundImage:
          "radial-gradient(120% 140% at 0% 0%, #bfe9dd 0%, rgba(191,233,221,0) 45%), radial-gradient(120% 140% at 100% 100%, #f6b8d0 0%, rgba(246,184,208,0) 50%), radial-gradient(90% 120% at 80% 10%, #f3c98a 0%, rgba(243,201,138,0) 45%), linear-gradient(135deg, #8f6fe0 0%, #7c5cd6 45%, #6a49cf 100%)",
      }}
    >
      <div className="absolute inset-0 bg-white/10" />

      <div className="relative flex h-full flex-col p-5 xl:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[16px] leading-7 text-heading xl:text-[18px]">
            Today&apos;s Attendance
          </h2>
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-rose-500">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            QR Expired
          </span>
        </div>

        <p className="mt-1 text-[13px] font-medium text-heading/55 xl:text-sm">
          Last updated on {TODAY_ATTENDANCE.lastUpdated}
        </p>

        <div className="mt-4 flex flex-1 items-center gap-3 xl:mt-5 xl:gap-4">
          <div className="flex flex-1 flex-wrap gap-2.5 xl:gap-3">
            {TODAY_ATTENDANCE_STATS.map((stat) => (
              <div
                key={stat.label}
                className="min-w-[84px] flex-1 rounded-xl border border-white/60 bg-white/30 px-4 py-2.5 backdrop-blur-[10.8px] xl:px-5 xl:py-3"
              >
                <p className="text-[13px] font-medium text-heading/70 xl:text-sm">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-xl font-semibold text-heading xl:text-[26px]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <RadialProgress
            value={TODAY_ATTENDANCE.attendancePct}
            size={112}
            strokeWidth={11}
            trackColor="rgba(255,255,255,0.5)"
            progressColor="#5a34c9"
            className="hidden shrink-0 sm:block xl:!h-[128px] xl:!w-[128px]"
          >
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold text-heading xl:text-2xl">
                {TODAY_ATTENDANCE.attendancePct}%
              </span>
              <span className="text-[10px] font-medium text-heading/60 xl:text-[12px]">
                Attendance %
              </span>
            </div>
          </RadialProgress>
        </div>
      </div>
    </div>
  );
}

export function WelcomeAttendanceRow() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row xl:gap-6">
      <WelcomeCard />
      <TodayAttendanceCard />
    </div>
  );
}
