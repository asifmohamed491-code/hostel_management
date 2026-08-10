// models/PasswordResetOtp.ts
// One document per email, holding the current password-reset OTP
// (hashed) and, once that OTP is verified, the reset-session token
// (also hashed) used by /reset-password. Separate from models/User.ts
// so this short-lived, high-churn state never touches the user record
// itself.
import { Schema, model, models, type Model, type Document } from "mongoose";

export interface IPasswordResetOtp extends Document {
  email: string;
  /** bcrypt hash of the current OTP — never the raw OTP. */
  otpHash?: string;
  otpExpiresAt?: Date;
  otpAttempts: number;
  lastSentAt: Date;
  /** sha256 hash of the reset-session token issued after OTP verification. */
  resetTokenHash?: string;
  resetTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetOtpSchema = new Schema<IPasswordResetOtp>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    otpHash: {
      type: String,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      required: true,
    },
    resetTokenHash: {
      type: String,
      select: false,
    },
    resetTokenExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const PasswordResetOtp: Model<IPasswordResetOtp> =
  (models.PasswordResetOtp as Model<IPasswordResetOtp>) ||
  model<IPasswordResetOtp>("PasswordResetOtp", passwordResetOtpSchema);

export default PasswordResetOtp;