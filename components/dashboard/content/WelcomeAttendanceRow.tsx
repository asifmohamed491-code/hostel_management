"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-plugins";
import { TODAY_ATTENDANCE, TODAY_ATTENDANCE_STATS } from "@/lib/dashboard-mock";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export interface WelcomeCardProps {
  greeting?: string;
  name?: string;
  description?: string;
  details?: string;
}

export function WelcomeCard({
  greeting = "Welcome back,",
  name = "Warden",
  description = "Here's today's snapshot — attendance, room occupancy, and open requests across the hostel.",
  details,
}: WelcomeCardProps) {
  const welcomeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(".welcome-line, .welcome-desc", { opacity: 1, y: 0 });
        return;
      }

      if (!welcomeRef.current) return;

      const scrollerEl =
        document.getElementById("dashboard-scroll-container") || undefined;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: welcomeRef.current,
          scroller: scrollerEl,
          start: "top 95%",
          once: true,
        },
      });

      tl.fromTo(
        ".welcome-line",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
        }
      ).fromTo(
        ".welcome-desc",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
        "-=0.4"
      );
    },
    { scope: welcomeRef }
  );

  return (
    <div
      ref={welcomeRef}
      className={
        "welcome-card relative flex h-full flex-1 flex-col justify-center gap-4 " +
        "rounded-[20px] border border-white/60 p-6 xl:p-8 " +
        "bg-gradient-to-br from-white/90 via-purple-50/60 to-indigo-50/50 " +
        "shadow-lg shadow-purple-500/5 backdrop-blur-[17.4px]"
      }
    >
      <h1 className="text-[32px] leading-[1.15] text-heading xl:text-[44px]">
        <span className="welcome-line inline-block">{greeting}</span>
        <br />
        <span className="welcome-line inline-block">{name}</span>
      </h1>

      <p className="welcome-desc max-w-md text-[13.5px] font-medium leading-relaxed text-heading/50 xl:text-[15px]">
        {description}
      </p>

      {details && (
        <p className="welcome-desc max-w-lg text-[13px] font-semibold leading-relaxed text-heading/70 xl:text-[14.5px]">
          {details}
        </p>
      )}
    </div>
  );
}

function TodayAttendanceCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  const size = 120;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (TODAY_ATTENDANCE.attendancePct / 100) * circumference;

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set([circleRef.current, ".stat-num-value"], { clearProps: "all" });
        if (percentRef.current) {
          percentRef.current.textContent = `${TODAY_ATTENDANCE.attendancePct}%`;
        }
        gsap.utils.toArray<HTMLElement>(".stat-num-value").forEach((el, index) => {
          el.textContent = `${TODAY_ATTENDANCE_STATS[index]?.value ?? 0}`;
        });
        if (circleRef.current) {
          gsap.set(circleRef.current, { strokeDashoffset: targetOffset });
        }
        return;
      }

      if (!cardRef.current) return;

      const scrollerEl =
        document.getElementById("dashboard-scroll-container") || undefined;

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: cardRef.current,
          scroller: scrollerEl,
          start: "top 90%",
          once: true,
        },
      });

      if (circleRef.current) {
        tl.fromTo(
          circleRef.current,
          { strokeDashoffset: circumference },
          { strokeDashoffset: targetOffset, duration: 1.4, ease: "power3.inOut" },
          0
        );
      }

      if (percentRef.current) {
        const obj = { val: 0 };
        tl.to(
          obj,
          {
            val: TODAY_ATTENDANCE.attendancePct,
            duration: 1.4,
            ease: "power3.inOut",
            onUpdate: () => {
              if (percentRef.current) {
                percentRef.current.textContent = `${Math.round(obj.val)}%`;
              }
            },
          },
          0
        );
      }

      const statElements = gsap.utils.toArray<HTMLElement>(".stat-num-value");
      statElements.forEach((el, index) => {
        const targetVal = TODAY_ATTENDANCE_STATS[index]?.value || 0;
        const obj = { val: 0 };

        tl.to(
          obj,
          {
            val: targetVal,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = `${Math.round(obj.val)}`;
            },
          },
          0.2 + index * 0.1
        );
      });
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      className="today-card relative h-full flex-1 overflow-hidden rounded-[20px]"
      style={{
        backgroundImage:
          "radial-gradient(120% 140% at 0% 0%, #bfe9dd 0%, rgba(191,233,221,0) 45%), radial-gradient(120% 140% at 100% 100%, #f6b8d0 0%, rgba(246,184,208,0) 50%), radial-gradient(90% 120% at 80% 10%, #f3c98a 0%, rgba(243,201,138,0) 45%), linear-gradient(135deg, #8f6fe0 0%, #7c5cd6 45%, #6a49cf 100%)",
      }}
    >
      <div className="absolute inset-0 bg-white/10" />

      <div className="relative flex h-full flex-col p-5 xl:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-[16px] font-bold leading-7 text-heading xl:text-[18px]">
              Today&apos;s Attendance
            </h2>

            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[12px] font-bold text-emerald-700 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              Live
            </span>
          </div>

          <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-rose-600 border border-rose-200 shadow-xs backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            QR Expired
          </span>
        </div>

        <p className="mt-0.5 text-[12.5px] font-semibold text-heading/60 xl:text-sm">
          Last updated on {TODAY_ATTENDANCE.lastUpdated}
        </p>

        <div className="mt-4 flex flex-1 items-center justify-between gap-3 xl:mt-5 xl:gap-4">
          <div className="flex flex-1 flex-wrap gap-2.5 xl:gap-3">
            {TODAY_ATTENDANCE_STATS.map((stat) => (
              <div
                key={stat.label}
                className="min-w-[80px] flex-1 rounded-xl border border-white/60 bg-white/30 px-4 py-2.5 backdrop-blur-[10.8px] xl:px-5 xl:py-3 transition-transform hover:scale-[1.02]"
              >
                <p className="text-[12.5px] font-semibold text-heading/70 xl:text-sm">
                  {stat.label}
                </p>
                <p className="stat-num-value mt-0.5 text-xl font-bold text-heading xl:text-[26px]">
                  0
                </p>
              </div>
            ))}
          </div>

          <div className="relative hidden shrink-0 items-center justify-center sm:flex xl:!h-[128px] xl:!w-[128px]">
            <svg width={size} height={size} className="-rotate-90 transform">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                ref={circleRef}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#5a34c9"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                ref={percentRef}
                className="text-xl font-bold leading-none text-heading xl:text-2xl"
              >
                0%
              </span>
              <span className="mt-1 text-[10px] font-semibold tracking-tight text-heading/70 xl:text-[11px]">
                Attendance %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WelcomeAttendanceRow() {
  const { user, loading } = useCurrentUser();
  const safeWardenName = user?.fullName?.trim() || "Warden";

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row xl:gap-6">
      <WelcomeCard name={loading ? "Warden" : safeWardenName} />
      <TodayAttendanceCard />
    </div>
  );
}