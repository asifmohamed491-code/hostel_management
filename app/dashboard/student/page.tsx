import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard | OASYS Hostel Management",
};

// Placeholder only — the Student dashboard UI isn't ready yet.
export default function StudentDashboardPage() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold text-white">Student Dashboard</h1>
      <p className="text-sm text-white/70">Authentication Successful</p>
    </div>
  );
}
