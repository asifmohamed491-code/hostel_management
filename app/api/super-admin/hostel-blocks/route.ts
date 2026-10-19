// app/api/super-admin/hostel-blocks/route.ts
//   GET  /api/super-admin/hostel-blocks  — every block with live room / bed / occupancy / warden numbers
//   POST /api/super-admin/hostel-blocks  — register a block (name + code + description)
// Super Admin only (401 anonymous, 403 other roles), enforced server-side.
import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { HostelBlock } from "@/models/HostelBlock";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import { hostelBlockCreateSchema } from "@/lib/hostel-validation";
import {
  buildBlockSummaries,
  exactCaseInsensitive,
  getBlockSummary,
  listBlockNames,
} from "@/lib/hostel-block-data";

export const dynamic = "force-dynamic";

const SERVER_ERROR = { message: "Something went wrong. Please try again." };

export async function GET(request: NextRequest) {
  try {
    const denied = requireSuperAdmin(request);
    if (denied) return denied;

    await connectToDatabase();
    return NextResponse.json({ blocks: await buildBlockSummaries() }, { status: 200 });
  } catch (error) {
    console.error("List hostel blocks error:", error);
    return NextResponse.json(SERVER_ERROR, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const denied = requireSuperAdmin(request);
    if (denied) return denied;

    const body = await request.json().catch(() => null);
    const parsed = hostelBlockCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid hostel block details." },
        { status: 400 }
      );
    }
    const { name, code, description } = parsed.data;

    await connectToDatabase();

    if (await HostelBlock.exists({ name: exactCaseInsensitive(name) })) {
      return NextResponse.json(
        { message: "A hostel block with this name already exists." },
        { status: 409 }
      );
    }
    if (await HostelBlock.exists({ code })) {
      return NextResponse.json(
        { message: "A hostel block with this code already exists." },
        { status: 409 }
      );
    }

    // A block that so far only exists as a name on rooms/students can be
    // registered with its EXACT existing name; a different spelling/case of
    // an existing name would create an inconsistent second block.
    const existingNames = await listBlockNames();
    const lookalike = existingNames.find(
      (existing) => existing !== name && existing.toLowerCase() === name.toLowerCase()
    );
    if (lookalike) {
      return NextResponse.json(
        { message: `A block named "${lookalike}" already exists. Use that exact name.` },
        { status: 409 }
      );
    }

    await HostelBlock.create({ name, code, description });

    return NextResponse.json(
      { message: "Hostel block saved successfully.", block: await getBlockSummary(name) },
      { status: 201 }
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: number }).code === 11000) {
      const key = (error as { keyPattern?: Record<string, unknown> }).keyPattern;
      return NextResponse.json(
        {
          message: key && "code" in key
            ? "A hostel block with this code already exists."
            : "A hostel block with this name already exists.",
        },
        { status: 409 }
      );
    }
    console.error("Create hostel block error:", error);
    return NextResponse.json(SERVER_ERROR, { status: 500 });
  }
}
