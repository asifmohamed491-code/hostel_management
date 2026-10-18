"use client";

// RoomFormModal.tsx
// ONE reusable modal for both "Add Room" and "Edit Room" (mode prop).
// Fields follow the real Room model: Room Number, Hostel Block (read-only —
// it is the block being viewed) and Total Bed Capacity. There is no Floor
// field because the Room model has none.
//
// TEMPORARY (UI phase): onSubmit only updates local React state in
// SuperAdminRooms. No API call is made and nothing is written to MongoDB.
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BedDouble, Building2, DoorOpen, Lock, Pencil } from "lucide-react";

import { InputField } from "@/components/InputField";
import { RoomModal } from "@/components/dashboard/content/super-admin/rooms/RoomModal";
import { ROOM_CAPACITY_LIMITS, type RoomRow } from "@/lib/super-admin-rooms-mock";

export interface RoomFormValues {
  roomNumber: string;
  capacity: number;
}

interface FormFields {
  roomNumber: string;
  capacity: string;
}

interface RoomFormModalProps {
  mode: "add" | "edit";
  blockName: string;
  /** Required in edit mode: the room being edited (pre-fills the form). */
  room?: RoomRow;
  /** Room numbers already in use, EXCLUDING the room being edited. */
  takenRoomNumbers: string[];
  onClose: () => void;
  onSubmit: (values: RoomFormValues) => void;
}

function buildSchema(takenRoomNumbers: string[], minCapacity: number) {
  const { min, max } = ROOM_CAPACITY_LIMITS;
  return z.object({
    roomNumber: z
      .string()
      .trim()
      .min(1, "Room number is required")
      .max(20, "Room number must be 20 characters or fewer")
      .regex(/^[A-Za-z0-9-]+$/, "Use only letters, numbers and hyphens")
      .refine(
        (value) => !takenRoomNumbers.some((n) => n.toLowerCase() === value.toLowerCase()),
        "A room with this number already exists"
      ),
    capacity: z
      .string()
      .trim()
      .min(1, "Total bed capacity is required")
      .superRefine((value, ctx) => {
        const issue = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
        if (!/^\d+$/.test(value)) return issue("Enter a whole number");
        const n = Number(value);
        if (n < min) return issue(`Capacity must be at least ${min}`);
        if (n > max) return issue(`Capacity can't be more than ${max}`);
        if (n < minCapacity) {
          return issue(
            `${minCapacity} ${minCapacity === 1 ? "student is" : "students are"} already assigned — capacity can't be lower`
          );
        }
      }),
  });
}

const PRIMARY_BUTTON =
  "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white " +
  "shadow-md shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 " +
  "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

const GLASS_BUTTON =
  "sa-student-action-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 " +
  "text-[13px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-white hover:text-heading " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

export function RoomFormModal({
  mode,
  blockName,
  room,
  takenRoomNumbers,
  onClose,
  onSubmit,
}: RoomFormModalProps) {
  const isEdit = mode === "edit";
  const minCapacity = isEdit && room ? Math.max(1, room.occupied) : 1;
  const schema = useMemo(
    () => buildSchema(takenRoomNumbers, minCapacity),
    [takenRoomNumbers, minCapacity]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      roomNumber: isEdit && room ? room.roomNumber : "",
      capacity: isEdit && room ? String(room.capacity) : "4",
    },
  });

  function submit(values: FormFields) {
    onSubmit({ roomNumber: values.roomNumber.trim(), capacity: Number(values.capacity) });
  }

  return (
    <RoomModal
      title={isEdit ? "Edit Room" : "Add Room"}
      description={
        isEdit
          ? `Update room details in ${blockName}`
          : `Create a new room in ${blockName}`
      }
      icon={isEdit ? <Pencil className="h-[18px] w-[18px]" /> : <DoorOpen className="h-[18px] w-[18px]" />}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-3">
        <InputField
          label="Room Number"
          iconSrc="/assets/icons/room.svg"
          placeholder="e.g. A-105"
          autoComplete="off"
          data-autofocus
          error={errors.roomNumber?.message}
          {...register("roomNumber")}
        />

        {/* Hostel Block — read-only: it is the block currently being viewed. */}
        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="room-hostel-block" className="text-[12px] font-semibold text-heading/90">
            Hostel Block
          </label>
          <div className="flex items-center rounded-xl border border-white/60 bg-white/30 px-3 py-2.5">
            <Building2 className="mr-2 h-4 w-4 shrink-0 text-primary opacity-80" aria-hidden />
            <input
              id="room-hostel-block"
              readOnly
              value={blockName}
              aria-describedby="room-hostel-block-help"
              className="w-full cursor-not-allowed truncate bg-transparent text-[12.5px] font-medium text-heading/70 focus:outline-none"
            />
            <Lock className="ml-1.5 h-3.5 w-3.5 shrink-0 text-heading/35" aria-hidden />
          </div>
          <p id="room-hostel-block-help" className="text-[11px] font-medium text-heading/45">
            {isEdit
              ? "A room's block can't be changed from this screen."
              : "New rooms are created in the block you're viewing."}
          </p>
        </div>

        <div>
          <InputField
            label="Total Bed Capacity"
            iconSrc="/assets/icons/user.svg"
            placeholder="e.g. 4"
            inputMode="numeric"
            autoComplete="off"
            error={errors.capacity?.message}
            {...register("capacity")}
          />
          {isEdit && room && room.occupied > 0 && !errors.capacity && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-heading/45">
              <BedDouble className="h-3 w-3" aria-hidden />
              {room.occupied} {room.occupied === 1 ? "bed is" : "beds are"} currently occupied.
            </p>
          )}
        </div>

        <div className="mt-2 flex flex-col-reverse gap-2.5 sm:flex-row">
          <button type="button" onClick={onClose} className={GLASS_BUTTON}>
            Cancel
          </button>
          <button type="submit" className={PRIMARY_BUTTON}>
            {isEdit ? "Save Changes" : "Create Room"}
          </button>
        </div>
      </form>
    </RoomModal>
  );
}
