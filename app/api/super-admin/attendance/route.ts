// app/api/super-admin/attendance/route.ts
//
// GET /api/super-admin/attendance — everything the Super Admin "View
// Attendance" page needs for ONE attendance session: the available dates,
// the sessions of the chosen date, the chosen session's details, the summary
// counts and one page of student attendance rows. Read-only, Super Admin
// only (401 anonymous, 403 other roles). It never exposes passwords, tokens
// or GPS coordinates.
//
// Selecting the session: `sessionId` wins; else `date` (the latest session of
// that date); else the latest session overall. Summary counts and the table
// come from the SAME classification (lib/attendance-report.ts), so they can
// never disagree. See that file for the attendance rules.
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { AttendanceRecord } from "@/models/AttendanceRecord";
import { AttendanceSession } from "@/models/AttendanceSession";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import { escapeRegex } from "@/lib/hostel-block-data";
import {
  attendancePercentage,
  classifyStudents,
  getSessionState,
  type AttendanceResponse,
  type AttendanceRow,
  type AttendanceStatus,
  type RecordLite,
  type SessionInfo,
} from "@/lib/attendance-report";

export const dynamic = "force-dynamic";

const text = (max: number) => z.string().trim().max(max, "Filter value is too long");

const querySchema = z.object({
  sessionId: z.string().trim().regex(/^[a-f\d]{24}$/i, "Invalid session ID").optional(),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date").optional(),
  query: text(80).default(""),
  status: z.enum(["all", "present", "late", "absent"]).default("all"),
  block: text(60).default("all"),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const toIds = (ids: string[]) => ids.map((id) => new Types.ObjectId(id));

function cleanList(values: unknown[]): string[] {
  return Array.from(
    new Set(values.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

const empty = (dates: string[], blocks: string[], totalStudents: number, page: number, limit: number): AttendanceResponse => ({
  dates,
  sessions: [],
  session: null,
  summary: { totalStudents, eligible: 0, present: 0, late: 0, absent: 0, percentage: null },
  records: [],
  total: 0,
  page,
  limit,
  totalPages: 1,
  filterOptions: { blocks },
});

export async function GET(request: NextRequest) {
  try {
    const denied = requireSuperAdmin(request);
    if (denied) return denied;

    const params = request.nextUrl.searchParams;
    const parsed = querySchema.safeParse({
      sessionId: params.get("sessionId") ?? undefined,
      date: params.get("date") ?? undefined,
      query: params.get("query") ?? undefined,
      status: params.get("status") ?? undefined,
      block: params.get("block") ?? undefined,
      page: params.get("page") ?? undefined,
      limit: params.get("limit") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid query parameters." },
        { status: 400 }
      );
    }
    const { sessionId, date, query, status, block, page, limit } = parsed.data;

    await connectToDatabase();

    const [sessionDates, studentBlocks, totalStudents] = await Promise.all([
      AttendanceSession.distinct("date"),
      User.distinct("hostelBlock", { role: "student" }),
      User.countDocuments({ role: "student" }),
    ]);
    const dates = cleanList(sessionDates).reverse().slice(0, 180); // newest first
    const blocks = cleanList(studentBlocks);

    // ---- choose the session ----
    let session = null;
    if (sessionId) {
      session = await AttendanceSession.findById(sessionId).lean();
      if (!session) {
        return NextResponse.json({ message: "Attendance session not found." }, { status: 404 });
      }
    } else if (date) {
      session = await AttendanceSession.findOne({ date }).sort({ createdAt: -1 }).lean();
    } else {
      session = await AttendanceSession.findOne({}).sort({ createdAt: -1 }).lean();
    }
    if (!session) return NextResponse.json(empty(dates, blocks, totalStudents, page, limit), { status: 200 });

    // ---- sessions of that date (for the selector) ----
    const dateSessions = await AttendanceSession.find({ date: session.date })
      .sort({ createdAt: -1 })
      .lean();
    const wardenIds = Array.from(new Set(dateSessions.map((s) => s.generatedBy.toString())));
    const wardens = await User.find({ _id: { $in: toIds(wardenIds) } }).select("fullName").lean();
    const wardenName = new Map(wardens.map((w) => [w._id.toString(), w.fullName]));
    const now = Date.now();
    const toInfo = (s: (typeof dateSessions)[number]): SessionInfo => ({
      id: s._id.toString(),
      date: s.date,
      createdAt: new Date(s.createdAt ?? s.generatedAt ?? now).toISOString(),
      expiresAt: new Date(s.expiresAt).toISOString(),
      active: s.active,
      state: getSessionState(s.active, new Date(s.expiresAt).getTime(), now),
      generatedByName: wardenName.get(s.generatedBy.toString()) ?? null,
    });
    const sessions = dateSessions.map(toInfo);
    const selectedId = session._id.toString();
    const info = sessions.find((s) => s.id === selectedId) ?? toInfo(session);

    // ---- who was expected, and what happened (ONE classification for summary + table) ----
    const generatedAt = new Date(session.createdAt ?? session.generatedAt ?? now);
    const expected = await User.find({
      role: "student",
      $or: [{ createdAt: { $lte: generatedAt } }, { createdAt: { $exists: false } }],
    })
      .select("_id")
      .lean();
    const expectedIds = expected.map((u) => u._id.toString());

    const dateRecords = expectedIds.length
      ? await AttendanceRecord.find({ date: session.date, student: { $in: toIds(expectedIds) } })
          .select("student attendanceSession status markedAt")
          .lean()
      : [];
    const lite: RecordLite[] = dateRecords.map((r) => ({
      student: r.student.toString(),
      sessionId: r.attendanceSession.toString(),
      status: r.status,
      markedAtMs: new Date(r.markedAt).getTime(),
    }));
    const cls = classifyStudents(expectedIds, lite, selectedId);

    const attended = cls.present.length + cls.late.length;
    const percentage = attendancePercentage(attended, cls.eligible.length);
    const recordCount = await AttendanceRecord.countDocuments({ attendanceSession: session._id });

    // ---- table: the expected students, filtered in MongoDB ----
    const baseIds =
      status === "present" ? cls.present : status === "late" ? cls.late : status === "absent" ? cls.absent : cls.eligible;
    const and: Record<string, unknown>[] = [{ role: "student" }, { _id: { $in: toIds(baseIds) } }];
    if (query) {
      const pattern = new RegExp(escapeRegex(query), "i");
      and.push({ $or: [{ fullName: pattern }, { registerNumber: pattern }] });
    }
    if (block !== "all") and.push({ hostelBlock: block });
    const filter = { $and: and };

    const [total, students] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("fullName email phone registerNumber department year hostelBlock roomNumber")
        .sort({ fullName: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const pageRecords = students.length
      ? await AttendanceRecord.find({ date: session.date, student: { $in: students.map((s) => s._id) } }).lean()
      : [];
    const recordByStudent = new Map(pageRecords.map((r) => [r.student.toString(), r]));
    const presentSet = new Set(cls.present);
    const lateSet = new Set(cls.late);

    const records: AttendanceRow[] = students.map((s) => {
      const id = s._id.toString();
      const rowStatus: AttendanceStatus = presentSet.has(id) ? "present" : lateSet.has(id) ? "late" : "absent";
      const rec = recordByStudent.get(id);
      const own = rec && rec.attendanceSession.toString() === selectedId ? rec : undefined;
      const checkedIn = own && rowStatus !== "absent" ? own : undefined;
      return {
        studentId: id,
        recordId: own ? own._id.toString() : null,
        fullName: s.fullName,
        email: s.email,
        phone: s.phone?.trim() || null,
        registerNumber: s.registerNumber?.trim() || null,
        department: s.department?.trim() || null,
        year: s.year?.trim() || null,
        hostelBlock: s.hostelBlock?.trim() || null,
        roomNumber: s.roomNumber?.trim() || null,
        date: session.date,
        markedAt: checkedIn ? new Date(checkedIn.markedAt).toISOString() : null,
        status: rowStatus,
        markingMethod: checkedIn?.markingMethod ?? null,
        distanceMeters:
          checkedIn && typeof (checkedIn.distanceFromHostel ?? checkedIn.location?.distanceMeters) === "number"
            ? (checkedIn.distanceFromHostel ?? checkedIn.location?.distanceMeters ?? null)
            : null,
        sessionId: selectedId,
      };
    });

    const body: AttendanceResponse = {
      dates,
      sessions,
      session: {
        ...info,
        eligible: cls.eligible.length,
        present: cls.present.length,
        late: cls.late.length,
        absent: cls.absent.length,
        recordCount,
        percentage,
      },
      summary: {
        totalStudents,
        eligible: cls.eligible.length,
        present: cls.present.length,
        late: cls.late.length,
        absent: cls.absent.length,
        percentage,
      },
      records,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      filterOptions: { blocks },
    };
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error("Attendance overview error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
