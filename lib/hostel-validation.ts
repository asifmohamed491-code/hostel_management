// lib/hostel-validation.ts
//
// zod schemas for hostel blocks and rooms, shared by the forms (client) and
// the API routes (server, which re-validates everything). All object schemas
// are `.strict()` so a request carrying any unexpected key (e.g. `_id`,
// `role`) is rejected instead of silently ignored.
import { z } from "zod";
import { ROOM_CAPACITY_LIMITS } from "@/lib/hostel-rooms";

const blockName = z
  .string()
  .trim()
  .min(2, "Block name must be at least 2 characters")
  .max(40, "Block name must be 40 characters or fewer")
  .regex(/^[A-Za-z0-9][A-Za-z0-9 -]*$/, "Use letters, numbers, spaces and hyphens only");

const blockCode = z
  .string()
  .trim()
  .min(1, "Block code is required")
  .max(10, "Block code must be 10 characters or fewer")
  .regex(/^[A-Za-z0-9-]+$/, "Use only letters, numbers and hyphens")
  .transform((value) => value.toUpperCase());

const blockDescription = z
  .string()
  .trim()
  .max(200, "Description must be 200 characters or fewer");

export const hostelBlockCreateSchema = z
  .object({ name: blockName, code: blockCode, description: blockDescription })
  .strict();

/** PATCH body: the name is deliberately NOT editable (see models/HostelBlock.ts). */
export const hostelBlockUpdateSchema = z
  .object({ code: blockCode, description: blockDescription })
  .strict()
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "No changes were provided." });

export type HostelBlockFormValues = z.infer<typeof hostelBlockCreateSchema>;

export const roomNumberSchema = z
  .string()
  .trim()
  .min(1, "Room number is required")
  .max(20, "Room number must be 20 characters or fewer")
  .regex(/^[A-Za-z0-9-]+$/, "Use only letters, numbers and hyphens");

export const roomCapacitySchema = z
  .number({ invalid_type_error: "Capacity must be a number" })
  .int("Enter a whole number")
  .min(ROOM_CAPACITY_LIMITS.min, `Capacity must be at least ${ROOM_CAPACITY_LIMITS.min}`)
  .max(ROOM_CAPACITY_LIMITS.max, `Capacity can't be more than ${ROOM_CAPACITY_LIMITS.max}`);

export const roomCreateSchema = z
  .object({
    hostelBlock: z.string().trim().min(1, "Hostel block is required").max(60),
    roomNumber: roomNumberSchema,
    capacity: roomCapacitySchema,
  })
  .strict();

/** PATCH body: a room's block can't be changed here. */
export const roomUpdateSchema = z
  .object({ roomNumber: roomNumberSchema, capacity: roomCapacitySchema })
  .strict()
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "No changes were provided." });
