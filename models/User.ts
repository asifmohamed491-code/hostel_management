// models/User.ts
import { Schema, model, models, type Model, type Document } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "super_admin" | "warden" | "student";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  department?: string;
  year?: string;
  roomNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["super_admin", "warden", "student"],
      required: true,
    },
    department: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    roomNumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Only hash the password if it's new or was actually changed, so
  // unrelated field updates never re-hash an already-hashed password.
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>("User", userSchema);

export default User;
