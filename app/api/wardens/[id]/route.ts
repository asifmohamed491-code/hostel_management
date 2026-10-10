// app/api/wardens/[id]/route.ts
//
// Super Admin "Edit Warden" API.
//   GET   /api/wardens/:id — load one warden (+ the hostel blocks that
//                            can be assigned) to pre-fill the edit form
//   PATCH /api/wardens/:id — update ONLY fullName, email, phone and
//                            hostelBlock of an existing warden account
//
// Both handlers require an authenticated Super Admin (existing JWT
// cookie helpers). The target must exist AND have role "warden" — the
// role is part of every query filter, so this endpoint can never read or
// modify a student or another super admin. Passwords/hashes are never
// selected or returned, and the role is never writable here.
import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Room } from "@/models/Room";
import { getAuthPayload } from "@/lib/auth";
import { wardenUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

// Same partial-update rules as the edit form, but every key optional.
const patchBodySchema = wardenUpdateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No changes were provided.",
  });

interface WardenDoc {
  _id: { toString(): string };
  fullName: string;
  email: string;
  phone?: string;
  hostelBlock?: string;
  createdAt?: Date;
}

function toWardenResponse(doc: WardenDoc) {
  return {
    id: doc._id.toString(),
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone ?? "",
    hostelBlock: doc.hostelBlock?.trim() || "",
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}

async function listAssignableBlocks(): Promise<string[]> {
  const blocks = (await Room.distinct("hostelBlock")) as string[];
  return blocks
    .map((b) => (typeof b === "string" ? b.trim() : ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

/** Shared auth + id checks. Returns an error response, or the parsed id. */
async function authorize(
  request: NextRequest,
  context: RouteContext,
  action: string
): Promise<{ error: NextResponse } | { id: string }> {
  const payload = getAuthPayload(request);

  if (!payload) {
    return {
      error: NextResponse.json({ message: "Not authenticated." }, { status: 401 }),
    };
  }

  if (payload.role !== "super_admin") {
    return {
      error: NextResponse.json(
        { message: `Only a Super Admin can ${action} Warden accounts.` },
        { status: 403 }
      ),
    };
  }

  const { id } = await context.params;

  if (!/^[a-f\d]{24}$/i.test(id) || !isValidObjectId(id)) {
    return {
      error: NextResponse.json({ message: "Invalid warden ID." }, { status: 400 }),
    };
  }

  return { id };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authorize(request, context, "view");
    if ("error" in auth) return auth.error;

    await connectToDatabase();

    const warden = await User.findOne({ _id: auth.id, role: "warden" })
      .select("fullName email phone hostelBlock createdAt")
      .lean();

    if (!warden) {
      return NextResponse.json({ message: "Warden not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        warden: toWardenResponse(warden as WardenDoc),
        availableBlocks: await listAssignableBlocks(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get warden error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authorize(request, context, "edit");
    if ("error" in auth) return auth.error;

    const body = await request.json().catch(() => null);
    const parsed = patchBodySchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { message: firstIssue?.message ?? "Invalid warden details." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // The role is part of the filter: only an existing warden matches.
    const current = await User.findOne({ _id: auth.id, role: "warden" })
      .select("hostelBlock")
      .lean();

    if (!current) {
      return NextResponse.json({ message: "Warden not found." }, { status: 404 });
    }

    const { fullName, phone, hostelBlock } = parsed.data;
    const email = parsed.data.email?.toLowerCase();

    if (email) {
      const duplicate = await User.findOne({ email, _id: { $ne: auth.id } })
        .select("_id")
        .lean();

      if (duplicate) {
        return NextResponse.json(
          { message: "A user with this email already exists." },
          { status: 409 }
        );
      }
    }

    // Only an existing hostel block (or the warden's current value, so an
    // unrelated edit never fails) may be assigned.
    if (hostelBlock && hostelBlock !== (current.hostelBlock ?? "").trim()) {
      const blocks = await listAssignableBlocks();
      if (!blocks.includes(hostelBlock)) {
        return NextResponse.json(
          { message: "Select a valid hostel block." },
          { status: 400 }
        );
      }
    }

    // Explicit whitelist — the update document is built field by field,
    // never from the request body object itself.
    const $set: Record<string, string> = {};
    const $unset: Record<string, ""> = {};
    if (fullName !== undefined) $set.fullName = fullName;
    if (email !== undefined) $set.email = email;
    if (phone !== undefined) $set.phone = phone;
    if (hostelBlock !== undefined) {
      if (hostelBlock) $set.hostelBlock = hostelBlock;
      else $unset.hostelBlock = "";
    }

    const update: Record<string, unknown> = {};
    if (Object.keys($set).length > 0) update.$set = $set;
    if (Object.keys($unset).length > 0) update.$unset = $unset;

    const updated = await User.findOneAndUpdate(
      { _id: auth.id, role: "warden" },
      update,
      { new: true, runValidators: true }
    )
      .select("fullName email phone hostelBlock createdAt")
      .lean();

    if (!updated) {
      return NextResponse.json({ message: "Warden not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Warden updated successfully.",
        warden: toWardenResponse(updated as WardenDoc),
      },
      { status: 200 }
    );
  } catch (error) {
    // Unique-index race: two requests claiming the same email at once.
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { message: "A user with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Update warden error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
