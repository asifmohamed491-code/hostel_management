// app/api/auth/reset-password/route.ts
// Consumes the reset-session token issued by
// /api/auth/forgot-password/verify-otp and sets the new password.
// Reuses models/User.ts's own pre-save hashing (assigning user.password
// and calling save() — the exact mechanism signup/login already rely
// on) rather than re-implementing password hashing here.
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordResetOtp } from "@/models/PasswordResetOtp";
import { resetPasswordApiSchema } from "@/lib/validation";
import { hashResetToken } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = resetPasswordApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { resetToken, password } = parsed.data;

    await connectToDatabase();

    const record = await PasswordResetOtp.findOne({ email }).select(
      "+resetTokenHash"
    );

    if (
      !record ||
      !record.resetTokenHash ||
      !record.resetTokenExpiresAt ||
      record.resetTokenExpiresAt.getTime() < Date.now()
    ) {
      return NextResponse.json(
        { message: "This reset session has expired. Please start again." },
        { status: 400 }
      );
    }

    if (record.resetTokenHash !== hashResetToken(resetToken)) {
      return NextResponse.json(
        { message: "This reset session is invalid. Please start again." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email." },
        { status: 404 }
      );
    }

    // Triggers the existing pre-save hook in models/User.ts, which
    // hashes the password the same way signup/login already do.
    user.password = password;
    await user.save();

    // Single-use — remove the reset session so neither the token nor
    // the OTP it came from can ever be replayed.
    await PasswordResetOtp.deleteOne({ email });

    return NextResponse.json(
      { message: "Password reset successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}