"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { InitialsAvatar } from "@/components/dashboard/content/InitialsAvatar";
import { cn } from "@/lib/cn";
import {
  exportAttendanceToExcel,
  exportAttendanceToPdf,
  type ExportAttendanceRecord,
  type AttendanceBlockSummary,
  type AttendanceReportSummary,
} from "@/lib/attendance-export";

interface AttendanceReportItem extends ExportAttendanceRecord {
  id: string;
  studentId?: string;
  formattedDate: string;
}

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AttendanceReportPage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceReportItem[]>([]);
  const [allExportRecords, setAllExportRecords] = useState<AttendanceReportItem[]>([]);
  const [summary, setSummary] = useState<AttendanceReportSummary>({
    totalStudents: 0,
    present: 0,
    absent: 0,
    overallAttendancePct: "0%",
  });
  const [blockSummary, setBlockSummary] = useState<AttendanceBlockSummary[]>([]);
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(getTodayString());

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
      setAllExportRecords(data.allRecordsForExport || data.records || []);
      if (data.summary) setSummary(data.summary);
      if (data.blockSummary) setBlockSummary(data.blockSummary);
      if (data.formattedDate) setFormattedDate(data.formattedDate);
    } catch (err) {
      console.error("Failed to load attendance report:", err);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter, search]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleExportPdf = () => {
    const dataToExport = allExportRecords.length > 0 ? allExportRecords : records;
    exportAttendanceToPdf(dataToExport, {
      selectedDate: dateFilter || getTodayString(),
      formattedDate,
      summary,
      blockSummary,
    });
  };

  const handleExportExcel = () => {
    const dataToExport = allExportRecords.length > 0 ? allExportRecords : records;
    exportAttendanceToExcel(
      dataToExport,
      `OASYS-Attendance-Report-${dateFilter || getTodayString()}.xlsx`
    );
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
            Comprehensive attendance records across all students and hostel blocks.
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
            className="inline-flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-2.5 text-[13px] font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white active:scale-95 cursor-pointer shadow-xs"
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

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:gap-4">
        <div className="sa-dashboard-card rounded-[20px] border border-white/60 bg-white/70 p-4 backdrop-blur-[20px] shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-heading/50">Total Students</p>
          <p className="mt-1 text-2xl font-bold text-heading">{summary.totalStudents}</p>
        </div>
        <div className="sa-dashboard-card rounded-[20px] border border-white/60 bg-white/70 p-4 backdrop-blur-[20px] shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Present</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{summary.present}</p>
        </div>
        <div className="sa-dashboard-card rounded-[20px] border border-white/60 bg-white/70 p-4 backdrop-blur-[20px] shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Absent</p>
          <p className="mt-1 text-2xl font-bold text-rose-500">{summary.absent}</p>
        </div>
        <div className="sa-dashboard-card rounded-[20px] border border-white/60 bg-white/70 p-4 backdrop-blur-[20px] shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Overall Attendance %</p>
          <p className="mt-1 text-2xl font-bold text-primary">{summary.overallAttendancePct}</p>
        </div>
      </div>

      {/* Block-wise Attendance Summary Card */}
      {blockSummary.length > 0 && (
        <div className="sa-dashboard-card flex flex-col rounded-[20px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px] shadow-sm">
          <div className="flex items-center gap-2 mb-3.5">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="text-[14.5px] font-bold text-heading">Block-wise Attendance Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-left">
              <thead>
                <tr className="border-b border-heading/10 pb-2.5 text-[11px] font-bold uppercase tracking-wider text-heading/45">
                  <th className="py-2 px-3">Hostel Block</th>
                  <th className="py-2 px-3 text-center">Total Students</th>
                  <th className="py-2 px-3 text-center">Present</th>
                  <th className="py-2 px-3 text-center">Absent</th>
                  <th className="py-2 px-3 text-center">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heading/[0.05] text-[13px]">
                {blockSummary.map((b) => (
                  <tr key={b.hostelBlock} className="transition-colors hover:bg-heading/[0.02]">
                    <td className="py-2.5 px-3 font-semibold text-heading">{b.hostelBlock}</td>
                    <td className="py-2.5 px-3 text-center font-medium text-heading/70">{b.totalStudents}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-emerald-600">{b.present}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-rose-500">{b.absent}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-primary">{b.attendancePct}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-heading/15 bg-heading/[0.03] font-bold">
                  <td className="py-2.5 px-3 text-heading">TOTAL</td>
                  <td className="py-2.5 px-3 text-center text-heading">{summary.totalStudents}</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600">{summary.present}</td>
                  <td className="py-2.5 px-3 text-center text-rose-500">{summary.absent}</td>
                  <td className="py-2.5 px-3 text-center text-primary">{summary.overallAttendancePct}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="sa-dashboard-card flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/60 bg-white/70 p-3.5 backdrop-blur-[20px]">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl bg-white/80 px-3 py-2 border border-heading/10">
            <Search className="h-4 w-4 text-heading/40" />
            <input
              type="text"
              placeholder="Search by student name, register no, or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-[13px] font-medium text-heading placeholder:text-heading/35 focus:outline-none"
            />
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 border border-heading/10">
            <Calendar className="h-4 w-4 text-heading/40" />
            <span className="text-[12px] font-semibold text-heading/50">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-[13px] font-medium text-heading focus:outline-none cursor-pointer"
            />
            {dateFilter !== getTodayString() && (
              <button
                type="button"
                onClick={() => setDateFilter(getTodayString())}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Today
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter attendance by status"
            className="rounded-xl bg-white/80 px-3 py-2 text-[13px] font-medium text-heading border border-heading/10 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
          </select>
        </div>
      </div>

      {/* Student Attendance Details Table */}
      <div className="sa-dashboard-card flex flex-col rounded-[20px] border border-white/60 bg-white/70 p-5 backdrop-blur-[20px] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14.5px] font-bold text-heading">Student Attendance Details</h2>
          <span className="text-[12px] font-semibold text-heading/50">
            Showing {records.length} records
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-[13px] font-medium text-heading/50">Loading attendance records…</p>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-heading/20" />
            <p className="mt-3 text-[15px] font-bold text-heading">No attendance records found</p>
            <p className="mt-1 text-[13px] font-medium text-heading/50">Try selecting a different date or clearing search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-heading/10 pb-3 text-[11px] font-bold uppercase tracking-wider text-heading/40">
                  <th className="py-3 px-3 text-center" style={{ width: "40px" }}>S.No</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Register No</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3 text-center">Year</th>
                  <th className="py-3 px-3 text-center">Hostel Block</th>
                  <th className="py-3 px-3 text-center">Room No</th>
                  <th className="py-3 px-3 text-center">Check-in Time</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heading/[0.05]">
                {records.map((row, index) => {
                  const isPresent = row.status.toLowerCase() === "present";
                  return (
                    <tr key={row.id} className="transition-colors hover:bg-heading/[0.02]">
                      <td className="py-3 px-3 text-center text-[12.5px] font-mono text-heading/50">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <InitialsAvatar
                            initials={row.studentName.slice(0, 2).toUpperCase()}
                            size={30}
                          />
                          <p className="truncate text-[13.5px] font-semibold text-heading">{row.studentName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[13px] font-mono font-medium text-heading/70">
                        {row.registerNumber || "—"}
                      </td>
                      <td className="py-3 px-3 text-[13px] font-medium text-heading/70">
                        {row.department || "—"}
                      </td>
                      <td className="py-3 px-3 text-center text-[13px] font-medium text-heading/70">
                        {row.year || "—"}
                      </td>
                      <td className="py-3 px-3 text-center text-[13px] font-medium text-heading/70">
                        {row.hostelBlock || "—"}
                      </td>
                      <td className="py-3 px-3 text-center text-[13px] font-medium text-heading/70">
                        {row.roomNumber || "—"}
                      </td>
                      <td className="py-3 px-3 text-center text-[13px] font-medium text-heading/70 whitespace-nowrap">
                        {row.time || "—"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase",
                            isPresent
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          )}
                        >
                          {isPresent ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

