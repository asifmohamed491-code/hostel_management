"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import { cn } from "@/lib/cn";
import { exportAttendanceToCsv, exportAttendanceToPdf, type ExportAttendanceRecord } from "@/lib/attendance-export";

interface AttendanceReportItem extends ExportAttendanceRecord {
  id: string;
  formattedDate: string;
}

const STATUS_STYLES: Record<string, string> = {
  present: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  late: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  absent: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

export default function AttendanceReportPage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFilter) params.append("date", dateFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/attendance/report?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load report");
      const data = await res.json();
      setRecords(data.records || []);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter, search]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const totalPresent = records.filter((r) => r.status.toLowerCase() === "present").length;
  const totalLate = records.filter((r) => r.status.toLowerCase() === "late").length;
  const totalAbsent = records.filter((r) => r.status.toLowerCase() === "absent").length;

  const handleExportPdf = () => {
    exportAttendanceToPdf(records, `OASYS Attendance Report ${dateFilter ? `(${dateFilter})` : ""}`);
  };

  const handleExportExcel = () => {
    exportAttendanceToCsv(records, `oasys-attendance-report-${dateFilter || "all"}.csv`);
  };

  return (
    <div className="flex w-full flex-col gap-5 pt-4 xl:gap-6 xl:pt-5 pb-10">
      {/* Back Button & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => router.push("/dashboard/warden")}
            className="group flex w-fit items-center gap-2 rounded-xl px-2 py-1 text-[13px] font-semibold text-heading/70 transition-all duration-200 hover:text-primary cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to Dashboard
          </button>
          <h1 className="text-[22px] font-bold text-heading sm:text-[26px]">
            Attendance Report
          </h1>
          <p className="text-[13px] font-medium text-heading/50 sm:text-[14px]">
            Comprehensive attendance records across all students and sessions.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchRecords}
            className="liquid-glass inline-flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-2.5 text-[13px] font-semibold text-heading/70 transition-all duration-200 hover:bg-white active:scale-95 cursor-pointer shadow-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin text-primary")} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-[13px] font-semibold text-rose-700 transition-all duration-200 hover:bg-rose-500/20 active:scale-95 cursor-pointer shadow-xs"
          >
            <FileText className="h-3.5 w-3.5" />
            Export PDF
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-[13px] font-semibold text-emerald-700 transition-all duration-200 hover:bg-emerald-500/20 active:scale-95 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:gap-4">
        <div className="sa-dashboard-card rounded-[20px] border border-white/60 bg-white/70 p-4 backdrop-blur-[20px]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-heading/40">Total Records</p>
          <p className="mt-1 text-2xl font-bold text-heading">{records.length}</p>
        </div>
        <div className="sa-dashboard-card rounded-[20px] border border-white/60 bg-white/70 p-4 backdrop-blur-[20px]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Present</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{totalPresent}</p>
        </div>
        <div className="sa-dashboard-card rounded-[20px] border border-white/60 bg-white/70 p-4 backdrop-blur-[20px]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Late</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{totalLate}</p>
        </div>
        <div className="sa-dashboard-card rounded-[20px] border border-white/60 bg-white/70 p-4 backdrop-blur-[20px]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Absent</p>
          <p className="mt-1 text-2xl font-bold text-rose-500">{totalAbsent}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sa-dashboard-card flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/60 bg-white/70 p-3.5 backdrop-blur-[20px]">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl bg-white/80 px-3 py-2 border border-heading/10">
            <Search className="h-4 w-4 text-heading/40" />
            <input
              type="text"
              placeholder="Search by student name or register no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-[13px] font-medium text-heading placeholder:text-heading/35 focus:outline-none"
            />
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 border border-heading/10">
            <Calendar className="h-4 w-4 text-heading/40" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-[13px] font-medium text-heading focus:outline-none"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="text-[11px] font-bold text-heading/40 hover:text-heading"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter attendance by status"
            className="rounded-xl bg-white/80 px-3 py-2 text-[13px] font-medium text-heading border border-heading/10 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Report Table */}
      <div className="sa-dashboard-card flex flex-col rounded-[20px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px] shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-[13px] font-medium text-heading/50">Loading attendance report…</p>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-heading/20" />
            <p className="mt-3 text-[15px] font-bold text-heading">No attendance records found</p>
            <p className="mt-1 text-[13px] font-medium text-heading/50">Try adjusting your date or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-heading/10 pb-3 text-[11px] font-bold uppercase tracking-wider text-heading/40">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Register No</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Room</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Check-in Time</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heading/[0.05]">
                {records.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-heading/[0.02]">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <InitialsAvatar
                          initials={row.studentName.slice(0, 2).toUpperCase()}
                          size={32}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-semibold text-heading">{row.studentName}</p>
                          <p className="truncate text-[11px] font-medium text-heading/45">{row.hostelBlock || "Block A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[13px] font-mono font-medium text-heading/70">
                      {row.registerNumber || "—"}
                    </td>
                    <td className="py-3.5 px-3 text-[13px] font-medium text-heading/70">
                      {row.department || "Computer Science"}
                    </td>
                    <td className="py-3.5 px-3 text-[13px] font-semibold text-heading">
                      {row.roomNumber?.startsWith("Room") ? row.roomNumber : `Room ${row.roomNumber || "214"}`}
                    </td>
                    <td className="py-3.5 px-3 text-[13px] font-medium text-heading/70 whitespace-nowrap">
                      {row.formattedDate || row.date}
                    </td>
                    <td className="py-3.5 px-3 text-[13px] font-medium text-heading/70 whitespace-nowrap">
                      {row.time || "—"}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold uppercase",
                          STATUS_STYLES[row.status.toLowerCase()] || STATUS_STYLES.present
                        )}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right text-[12.5px] font-mono font-medium text-heading/60">
                      {row.distanceMeters !== undefined ? `${row.distanceMeters} m` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
