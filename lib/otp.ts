// lib/otp.ts
// OTP + password-reset-token helpers used by the forgot-password flow
// (app/api/auth/forgot-password/*, app/api/auth/reset-password). Kept
// separate from lib/auth.ts (login/session auth) since this is a
// different, short-lived credential.
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const RESET_TOKEN_EXPIRY_MINUTES = 10;

/** Cryptographically random 6-digit numeric OTP, zero-padded. */
export function generateOtp(): string {
  const otp = crypto.randomInt(0, 1_000_000);
  return otp.toString().padStart(OTP_LENGTH, "0");
}

/**
 * Hashes the OTP the same way models/User.ts hashes passwords (bcrypt),
 * so the raw OTP is never persisted — only ever held in memory long
 * enough to email it.
 */
export function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export function compareOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

/** Opaque, single-use token handed to the client once the OTP is verified. */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/** Only the hash is ever stored — the raw token lives only on the client. */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}