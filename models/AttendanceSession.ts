// models/AttendanceSession.ts
//
// Represents an active attendance session created by a warden.
// One session per day per warden. The token is the QR payload.
// ─── ARCHITECTURE NOTE ──────────────────────────────────────────────
//   The `token` field stores the unique session identifier that the
//   warden "generates" as a QR. Students don't scan this physically;
//   the backend checks for a valid active session automatically.
// ────────────────────────────────────────────────────────────────────
import { Schema, model, models, type Model, type Document } from "mongoose";

export interface IAttendanceSession extends Document {
  token: string;
  generatedBy: Schema.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  createdAt: Date;
  expiresAt: Date;
  active: boolean;
}

const attendanceSessionSchema = new Schema<IAttendanceSession>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index: one active session per date
attendanceSessionSchema.index({ date: 1, active: 1 });

export const AttendanceSession: Model<IAttendanceSession> =
  (models.AttendanceSession as Model<IAttendanceSession>) ||
  model<IAttendanceSession>("AttendanceSession", attendanceSessionSchema);

export default AttendanceSession;

