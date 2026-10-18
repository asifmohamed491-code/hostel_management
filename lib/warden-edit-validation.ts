// lib/warden-edit-validation.ts
//
// Validation for the Super Admin "Edit Warden" form (client) and for
// PATCH /api/wardens/[id] (server, via `.partial()`). Kept in its own file
// so it does not depend on, or change, the existing schemas in
// lib/validation.ts (login / signup / create warden / create student).
//
// Only the four editable profile fields exist here. There is deliberately
// NO role, password, id or any other key, and the schema is `.strict()`:
// a request that tries to send one (e.g. `role: "super_admin"` or
// `password`) is rejected with a 400 instead of being silently ignored.
// `hostelBlock` may be "" which means "Unassigned".
import { z } from "zod";

const collegeEmail = z
  .string()
  .trim()
  .min(1, "College email is required")
  .email("Enter a valid email address");

export const wardenEditSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(60, "Full name is too long"),
    email: collegeEmail,
    phone: z
      .string()
      .trim()
      .min(10, "Enter a valid phone number")
      .max(15, "Enter a valid phone number")
      .regex(/^[0-9+\s-]+$/, "Enter a valid phone number"),
    hostelBlock: z.string().trim().max(40, "Hostel block name is too long"),
  })
  .strict();

export type WardenEditSchema = z.infer<typeof wardenEditSchema>;
