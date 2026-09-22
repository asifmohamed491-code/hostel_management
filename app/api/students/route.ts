// app/api/students/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getAuthPayload, toSafeUser } from "@/lib/auth";
import { addStudentSchema, type AddStudentSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const payload = getAuthPayload(request);

    if (!payload) {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    if (payload.role !== "warden") {
      return NextResponse.json(
        { message: "Only a Warden can create student accounts." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = addStudentSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { message: firstIssue?.message ?? "Invalid student details." },
        { status: 400 }
      );
    }

    const studentData = parsed.data as AddStudentSchema;

    // Never trust a role from the client â€” confirmPassword is intentionally
    // dropped since only the hashed `password` is persisted.
    const { fullName, email: rawEmail, phoneNumber, department, year, roomNumber, password, registerNumber, hostelBlock } = studentData;

    await connectToDatabase();

    const email = rawEmail.trim().toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
      return NextResponse.json(
        { message: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // Check register number uniqueness
    if (registerNumber) {
      const existingRegNo = await User.findOne({ registerNumber: registerNumber.trim() });
      if (existingRegNo) {
        return NextResponse.json(
          { message: "A student with this register number already exists." },
          { status: 409 }
        );
      }
    }

    const student = await User.create({
      fullName,
      email,
      phone: phoneNumber,
      department,
      year,
      roomNumber,
      hostelBlock,
      registerNumber: registerNumber.trim(),
      password,
      role: "student",
    });

    return NextResponse.json({ user: toSafeUser(student) }, { status: 201 });
  } catch (error) {
    console.error("Create student error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
