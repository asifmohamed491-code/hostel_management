// models/AttendanceRecord.ts
//
// Individual attendance record for a student on a given date.
// Linked to the AttendanceSession that was active when marked.
// Unique compound index on (student + date) prevents duplicates.
import { Schema, model, models, type Model, type Document } from "mongoose";

export interface IAttendanceRecord extends Document {
  student: Schema.Types.ObjectId;
  studentName: string;
  registerNumber: string;
  roomNumber: string;
  date: string; // "YYYY-MM-DD"
  markedAt: Date;
  status: "present" | "late" | "absent";
  attendanceSession: Schema.Types.ObjectId;
}

const attendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    registerNumber: {
      type: String,
      default: "",
      trim: true,
    },
    roomNumber: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["present", "late", "absent"],
      default: "present",
    },
    attendanceSession: {
      type: Schema.Types.ObjectId,
      ref: "AttendanceSession",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate: one record per student per day
attendanceRecordSchema.index({ student: 1, date: 1 }, { unique: true });

export const AttendanceRecord: Model<IAttendanceRecord> =
  (models.AttendanceRecord as Model<IAttendanceRecord>) ||
  model<IAttendanceRecord>("AttendanceRecord", attendanceRecordSchema);

export default AttendanceRecord;

