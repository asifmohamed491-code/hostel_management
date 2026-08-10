// app/api/auth/forgot-password/send-otp/route.ts
// Generates and emails a password-reset OTP. Also doubles as the
// "Resend OTP" endpoint — the ForgotPasswordForm calls this same route
// both times, and every call invalidates whatever OTP/reset-token
// existed before it.
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordResetOtp } from "@/models/PasswordResetOtp";
import { forgotPasswordSchema } from "@/lib/validation";
import {
  generateOtp,
  hashOtp,
  OTP_EXPIRY_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/lib/otp";
import { sendPasswordResetOtpEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "A valid email is required." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email." },
        { status: 404 }
      );
    }

    const existing = await PasswordResetOtp.findOne({ email });

    if (existing?.lastSentAt) {
      const secondsSinceLastSend =
        (Date.now() - existing.lastSentAt.getTime()) / 1000;

      if (secondsSinceLastSend < OTP_RESEND_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(
          OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend
        );
        return NextResponse.json(
          { message: `Please wait ${waitSeconds}s before requesting another OTP.` },
          { status: 429 }
        );
      }
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Upsert + explicit $unset: a fresh OTP request invalidates any
    // reset token issued for a previous, now-superseded OTP
    // verification, and resets the incorrect-attempt counter.
    await PasswordResetOtp.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          otpHash,
          otpExpiresAt,
          otpAttempts: 0,
          lastSentAt: new Date(),
        },
        $unset: { resetTokenHash: "", resetTokenExpiresAt: "" },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendPasswordResetOtpEmail(email, otp);

    return NextResponse.json(
      { message: "OTP sent to your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}