// lib/email.ts
// Password-reset OTP delivery. No email utility existed in the project
// yet, so this adds one nodemailer transporter, configured entirely
// from environment variables (never hardcoded), following the same
// "read from process.env, throw a clear error if missing" pattern as
// lib/mongodb.ts and lib/jwt.ts.
//
// Required environment variables (add to .env.local):
//   SMTP_HOST   - e.g. smtp.gmail.com, smtp.sendgrid.net
//   SMTP_PORT   - e.g. 587 (STARTTLS) or 465 (TLS)
//   SMTP_USER   - SMTP auth username
//   SMTP_PASS   - SMTP auth password / API key
// Optional:
//   SMTP_FROM   - display "From" address, defaults to SMTP_USER
import nodemailer, { type Transporter } from "nodemailer";
import { OTP_EXPIRY_MINUTES } from "@/lib/otp";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error(
      "Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your .env file to enable password-reset emails."
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  return cachedTransporter;
}

/**
 * Sends the password-reset OTP to the given email. Callers must pass
 * the raw OTP here (never persisted) — this function does not log it
 * or include it in any response, only in the outgoing email body.
 */
export async function sendPasswordResetOtpEmail(
  to: string,
  otp: string
): Promise<void> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `OASYS Hostel Management <${from}>`,
    to,
    subject: "Your OASYS password reset code",
    text: `Your OASYS password reset OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #4C1D95; margin-bottom: 4px;">OASYS Hostel Management</h2>
        <p style="color: #333; font-size: 14px;">Use the code below to reset your password. This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4C1D95; margin: 24px 0; text-align: center;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 12px;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}