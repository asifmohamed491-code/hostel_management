// app/api/wardens/[id]/route.ts
//
// Super Admin "Edit Warden" API.
//   GET   /api/wardens/:id — load one warden (+ the hostel blocks that
//                            can be assigned) to pre-fill the edit form
//   PATCH /api/wardens/:id — update an existing warden's fullName, email,
//                            phone, hostelBlock and (optionally) password
//
// Both handlers require an authenticated Super Admin (existing JWT
// cookie helpers). The target must exist AND have role "warden" — the
// role is part of every lookup, so this endpoint can never read or modify
// a student or another super admin. The role itself is never writable
// here (the body schema is strict). Password hashes are never returned.
//
// PATCH loads the warden as a Mongoose document and calls `.save()`, so
// the User model's existing pre-save hook hashes a new password exactly
// as it does at creation; if no new password is sent the stored hash is
// left untouched.
import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getAuthPayload } from "@/lib/auth";
import { listHostelBlocks } from "@/lib/hostel-blocks";
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
        availableBlocks: await listHostelBlocks(),
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

    // The role is part of the lookup: only an existing warden matches.
    // (+password is loaded only so `.save()` leaves the stored hash intact
    // and can replace it; it is never copied into a response.)
    const warden = await User.findOne({ _id: auth.id, role: "warden" }).select(
      "+password"
    );

    if (!warden) {
      return NextResponse.json({ message: "Warden not found." }, { status: 404 });
    }

    const { fullName, phone, hostelBlock, password } = parsed.data;
    const email = parsed.data.email?.toLowerCase();

    if (email !== undefined && email !== warden.email) {
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

    // The chosen block must be one that really exists in MongoDB.
    if (hostelBlock !== undefined) {
      const blocks = await listHostelBlocks();
      if (!blocks.includes(hostelBlock)) {
        return NextResponse.json(
          { message: "Select a valid hostel block." },
          { status: 400 }
        );
      }
    }

    // Explicit whitelist — fields are assigned one by one from validated
    // values, never by spreading the request body. `role` is never set.
    if (fullName !== undefined) warden.fullName = fullName;
    if (email !== undefined) warden.email = email;
    if (phone !== undefined) warden.phone = phone;
    if (hostelBlock !== undefined) warden.hostelBlock = hostelBlock;
    // "" / omitted = keep the current hash. A non-empty value was already
    // validated and is hashed by the model's pre-save hook.
    const passwordChanged = Boolean(password);
    if (password) warden.password = password;

    await warden.save();

    return NextResponse.json(
      {
        message: "Warden updated successfully.",
        passwordChanged,
        warden: toWardenResponse(warden as unknown as WardenDoc),
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
