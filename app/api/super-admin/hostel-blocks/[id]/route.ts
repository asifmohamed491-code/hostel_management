// app/api/super-admin/hostel-blocks/[id]/route.ts
//   PATCH /api/super-admin/hostel-blocks/:id — edit a registered block's code / description
// The NAME cannot be changed: rooms, students and wardens reference the block
// by its name string, so a rename would orphan them (the body schema is
// strict and has no `name`). Super Admin only.
import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { HostelBlock } from "@/models/HostelBlock";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import { hostelBlockUpdateSchema } from "@/lib/hostel-validation";
import { getBlockSummary } from "@/lib/hostel-block-data";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const denied = requireSuperAdmin(request);
    if (denied) return denied;

    const { id } = await context.params;
    if (!/^[a-f\d]{24}$/i.test(id) || !isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid hostel block ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = hostelBlockUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid hostel block details." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const block = await HostelBlock.findById(id).select("name").lean();
    if (!block) {
      return NextResponse.json({ message: "Hostel block not found." }, { status: 404 });
    }

    const { code, description } = parsed.data;

    if (code !== undefined && (await HostelBlock.exists({ code, _id: { $ne: id } }))) {
      return NextResponse.json(
        { message: "A hostel block with this code already exists." },
        { status: 409 }
      );
    }

    const $set: Record<string, string> = {};
    if (code !== undefined) $set.code = code;
    if (description !== undefined) $set.description = description;

    await HostelBlock.updateOne({ _id: id }, { $set }, { runValidators: true });

    return NextResponse.json(
      { message: "Hostel block updated successfully.", block: await getBlockSummary(block.name) },
      { status: 200 }
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { message: "A hostel block with this code already exists." },
        { status: 409 }
      );
    }
    console.error("Update hostel block error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
