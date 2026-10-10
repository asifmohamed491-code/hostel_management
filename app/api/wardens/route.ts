// app/api/wardens/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getAuthPayload, toSafeUser } from "@/lib/auth";
import { wardenSchema } from "@/lib/validation";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    if (payload.role !== "super_admin") {
      return NextResponse.json(
        { message: "Only a Super Admin can create Warden accounts." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = wardenSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { message: firstIssue?.message ?? "Invalid warden details." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
      return NextResponse.json(
        { message: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // Role is never taken from the client â€” always forced to "warden".
    const { fullName, phone, password } = parsed.data;

    const warden = await User.create({
      fullName,
      email,
      phone,
      password,
      role: "warden",
    });

    return NextResponse.json({ user: toSafeUser(warden) }, { status: 201 });
  } catch (error) {
    console.error("Create warden error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------
// GET /api/wardens — Manage Wardens list (Super Admin only).
//
// Query params (all optional, validated below):
//   q     — case-insensitive search across name, email and hostel block
//   page  — 1-based page number (default 1)
//   limit — page size, 1–50 (default 10)
//
// Only whitelisted, non-sensitive fields are projected. The password
// hash is never selected (it is also `select: false` on the schema).
// ---------------------------------------------------------------------
const listQuerySchema = z.object({
  q: z.string().trim().max(100, "Search text is too long").default(""),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    if (payload.role !== "super_admin") {
      return NextResponse.json(
        { message: "Only a Super Admin can view Warden accounts." },
        { status: 403 }
      );
    }

    const { searchParams } = request.nextUrl;
    const parsed = listQuerySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { message: firstIssue?.message ?? "Invalid query parameters." },
        { status: 400 }
      );
    }

    const { q, page, limit } = parsed.data;

    await connectToDatabase();

    // Role is fixed server-side — never taken from the client.
    const filter: Record<string, unknown> = { role: "warden" };

    if (q) {
      // User input is escaped so it is always matched literally and can
      // never be interpreted as a regex (no ReDoS / operator injection).
      const pattern = new RegExp(escapeRegex(q), "i");
      filter.$or = [
        { fullName: pattern },
        { email: pattern },
        { hostelBlock: pattern },
      ];
    }

    const [total, docs] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("fullName email phone hostelBlock createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const wardens = docs.map((doc) => ({
      id: doc._id.toString(),
      fullName: doc.fullName,
      email: doc.email,
      phone: doc.phone ?? null,
      hostelBlock: doc.hostelBlock?.trim() || null,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    }));

    return NextResponse.json(
      {
        wardens,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("List wardens error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
