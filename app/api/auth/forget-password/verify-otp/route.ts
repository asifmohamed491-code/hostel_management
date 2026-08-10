// app/api/auth/forgot-password/verify-otp/route.ts
// Validates the OTP server-side (never trusted from the frontend
// alone). On success, the OTP is cleared immediately — it is single-use
// and cannot be replayed — and a short-lived reset-session token is
// issued so the client can proceed to /reset-password without the OTP
// itself granting password-change access indefinitely.
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { PasswordResetOtp } from "@/models/PasswordResetOtp";
import { otpVerifySchema } from "@/lib/validation";
import {
  compareOtp,
  generateResetToken,
  hashResetToken,
  OTP_MAX_ATTEMPTS,
  RESET_TOKEN_EXPIRY_MINUTES,
} from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = otpVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "A valid 6-digit OTP is required." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { otp } = parsed.data;

    await connectToDatabase();

    const record = await PasswordResetOtp.findOne({ email }).select(
      "+otpHash +resetTokenHash"
    );

    if (!record || !record.otpHash || !record.otpExpiresAt) {
      return NextResponse.json(
        { message: "Please request a new OTP." },
        { status: 400 }
      );
    }

    if (record.otpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { message: "This OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (record.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json(
        { message: "Too many incorrect attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    const isValid = await compareOtp(otp, record.otpHash);

    if (!isValid) {
      record.otpAttempts += 1;
      await record.save();
      return NextResponse.json({ message: "Incorrect OTP." }, { status: 400 });
    }

    const resetToken = generateResetToken();

    record.resetTokenHash = hashResetToken(resetToken);
    record.resetTokenExpiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );
    // Clear the OTP itself so it can never be verified a second time.
    record.otpHash = undefined;
    record.otpExpiresAt = undefined;
    record.otpAttempts = 0;
    await record.save();

    return NextResponse.json(
      { message: "OTP verified.", resetToken },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}