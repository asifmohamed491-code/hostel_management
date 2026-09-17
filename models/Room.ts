// models/Room.ts
import { Schema, model, models, type Model, type Document } from "mongoose";

export interface IRoom extends Document {
  roomNumber: string;
  hostelBlock: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hostelBlock: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 4,
    },
  },
  { timestamps: true }
);

export const Room: Model<IRoom> =
  (models.Room as Model<IRoom>) || model<IRoom>("Room", roomSchema);

export default Room;

