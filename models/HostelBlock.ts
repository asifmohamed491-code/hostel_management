// models/HostelBlock.ts
//
// NEW collection (additive — Room and User are NOT changed). Stores the
// details of a hostel block: its name, a short unique code and a free-text
// description.
//
// RELATIONSHIP (unchanged project convention): rooms and users reference a
// block by its NAME string (Room.hostelBlock, User.hostelBlock). There is no
// ObjectId reference. That is why `name` is immutable once created (see
// PATCH /api/super-admin/hostel-blocks/[id]): renaming would orphan every
// room, student and warden that points at the old name.
//
// Blocks that already exist only as strings on rooms/students need no
// migration: they are listed too (see lib/hostel-block-data.ts) and get a
// HostelBlock document the first time a Super Admin saves their details.
import { Schema, model, models, type Model, type Document } from "mongoose";

export interface IHostelBlock extends Document {
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const hostelBlockSchema = new Schema<IHostelBlock>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export const HostelBlock: Model<IHostelBlock> =
  (models.HostelBlock as Model<IHostelBlock>) ||
  model<IHostelBlock>("HostelBlock", hostelBlockSchema);

export default HostelBlock;
