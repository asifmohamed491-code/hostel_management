// WardenAttendance.tsx
//
// Dedicated Warden Attendance Management page component.
// Houses the WardenAttendanceCard with page header and navigation.
"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { WardenAttendanceCard } from "./WardenAttendanceCard";

export function WardenAttendance() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-4 pt-4 xl:gap-5 xl:pt-5">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => router.push("/dashboard/warden")}
        className="group flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-heading/70 transition-all duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to Dashboard
      </button>

      {/* Page title */}
      <div className="px-1">
        <h1 className="text-[22px] font-bold text-heading sm:text-[26px]">
          Attendance Management
        </h1>
        <p className="mt-1 text-[13px] font-medium text-heading/50 sm:text-[14px]">
          Generate and manage today&apos;s attendance session for students.
        </p>
      </div>

      {/* Large desktop card */}
      <div className="pb-4">
        <WardenAttendanceCard />
      </div>
    </div>
  );
}
