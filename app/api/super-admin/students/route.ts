// app/api/super-admin/students/route.ts
//
// GET /api/super-admin/students — the data behind the Super Admin
// "View Student Report" page: one page of students (search + filters applied
// in MongoDB) with real attendance numbers, plus the unfiltered summary
// counts and the filter options. Super Admin only (401 anonymous, 403 other
// roles), checked on the server. Read-only: it never writes anything and
// never returns passwords or any authentication data.
//
// Query params (all optional, validated): query, department, year, block,
// allocation (all|allocated|unallocated), status (all|active|inactive),
// page, limit (1–50).
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { AttendanceSession } from "@/models/AttendanceSession";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import { escapeRegex } from "@/lib/hostel-block-data";
import { computeStudentAttendance, type AttendanceRecordLite } from "@/lib/student-attendance";
import type { StudentRow, StudentsResponse } from "@/lib/super-admin-students";

export const dynamic = "force-dynamic";

const text = (max: number) => z.string().trim().max(max, "Filter value is too long");

const querySchema = z.object({
  query: text(80).default(""),
  department: text(80).default("all"),
  year: text(40).default("all"),
  block: text(60).default("all"),
  allocation: z.enum(["all", "allocated", "unallocated"]).default("all"),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const HAS_ROOM = { roomNumber: { $exists: true, $ne: "" } };

function cleanList(values: unknown[]): string[] {
  return Array.from(
    new Set(values.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

export async function GET(request: NextRequest) {
  try {
    const denied = requireSuperAdmin(request);
    if (denied) return denied;

    const params = request.nextUrl.searchParams;
    const parsed = querySchema.safeParse({
      query: params.get("query") ?? undefined,
      department: params.get("department") ?? undefined,
      year: params.get("year") ?? undefined,
      block: params.get("block") ?? undefined,
      allocation: params.get("allocation") ?? undefined,
      status: params.get("status") ?? undefined,
      page: params.get("page") ?? undefined,
      limit: params.get("limit") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid query parameters." },
        { status: 400 }
      );
    }
    const { query, department, year, block, allocation, status, page, limit } = parsed.data;

    await connectToDatabase();

    // ---- filter (role is fixed server-side; user input is always escaped / exact) ----
    const and: Record<string, unknown>[] = [{ role: "student" }];
    if (query) {
      const pattern = new RegExp(escapeRegex(query), "i");
      and.push({ $or: [{ fullName: pattern }, { registerNumber: pattern }, { email: pattern }] });
    }
    if (department !== "all") and.push({ department });
    if (year !== "all") and.push({ year });
    if (block !== "all") and.push({ hostelBlock: block });
    if (allocation === "allocated") and.push(HAS_ROOM);
    if (allocation === "unallocated") {
      and.push({ $or: [{ roomNumber: { $exists: false } }, { roomNumber: "" }] });
    }
    // The schema has no deactivation field: every student account is active, so
    // "inactive" matches nobody (an impossible condition: every document has an _id).
    if (status === "inactive") and.push({ _id: { $exists: false } });
    const filter = { $and: and };

    const [total, docs, totalStudents, allocatedStudents, departments, years, blocks] =
      await Promise.all([
        User.countDocuments(filter),
        User.find(filter)
          .select("fullName email phone registerNumber department year hostelBlock roomNumber createdAt")
          .sort({ fullName: 1, _id: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "student", ...HAS_ROOM }),
        User.distinct("department", { role: "student" }),
        User.distinct("year", { role: "student" }),
        User.distinct("hostelBlock", { role: "student" }),
      ]);

    // ---- attendance for just this page of students ----
    const ids = docs.map((d) => d._id);
    const [records, sessionDates] = await Promise.all([
      ids.length
        ? AttendanceRecord.find({ student: { $in: ids } }).select("student date status").lean()
        : Promise.resolve([]),
      AttendanceSession.distinct("date"),
    ]);
    const recordsByStudent = new Map<string, AttendanceRecordLite[]>();
    for (const rec of records) {
      const key = rec.student.toString();
      const list = recordsByStudent.get(key) ?? [];
      list.push({ date: rec.date, status: rec.status });
      recordsByStudent.set(key, list);
    }

    const students: StudentRow[] = docs.map((doc) => {
      const id = doc._id.toString();
      return {
        id,
        fullName: doc.fullName,
        email: doc.email,
        phone: doc.phone?.trim() || null,
        registerNumber: doc.registerNumber?.trim() || null,
        department: doc.department?.trim() || null,
        year: doc.year?.trim() || null,
        hostelBlock: doc.hostelBlock?.trim() || null,
        roomNumber: doc.roomNumber?.trim() || null,
        attendance: computeStudentAttendance(
          recordsByStudent.get(id) ?? [],
          cleanList(sessionDates)
        ),
        status: (doc as { isActive?: boolean }).isActive === false ? "inactive" : "active",
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
      };
    });

    const body: StudentsResponse = {
      students,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      summary: {
        total: totalStudents,
        allocated: allocatedStudents,
        unallocated: totalStudents - allocatedStudents,
        active: totalStudents,
      },
      filterOptions: {
        departments: cleanList(departments),
        years: cleanList(years),
        blocks: cleanList(blocks),
      },
    };

    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error("List students error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
