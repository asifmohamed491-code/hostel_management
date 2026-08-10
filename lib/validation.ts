import { z } from "zod";

const collegeEmailSchema = z
  .string()
  .min(1, "College email is required")
  .email("Enter a valid email address");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number");

export const loginSchema = z.object({
  email: collegeEmailSchema,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: collegeEmailSchema,
});

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(60, "Full name is too long"),
    email: collegeEmailSchema,
    phoneNumber: z
      .string()
      .min(10, "Enter a valid phone number")
      .max(15, "Enter a valid phone number")
      .regex(/^[0-9+\s-]+$/, "Enter a valid phone number"),
    department: z
      .string()
      .min(2, "Department is required")
      .max(60, "Department is too long"),
    year: z
      .string()
      .min(1, "Year is required")
      .max(20, "Year is too long"),
    roomNumber: z
      .string()
      .min(1, "Room number is required")
      .max(20, "Room number is too long"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const wardenSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(60, "Full name is too long"),
  email: collegeEmailSchema,
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number")
    .regex(/^[0-9+\s-]+$/, "Enter a valid phone number"),
  password: passwordSchema,
});

// Client-only variant of wardenSchema for the "Create Warden" dashboard
// form (components/dashboard/forms usage). Adds a confirmPassword field
// purely for UI confirmation — it's stripped before the request body is
// sent to POST /api/wardens, so the API's own `wardenSchema` above is
// untouched and still governs what the server accepts.
export const wardenCreateFormSchema = wardenSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Forgot-password OTP verification — POST /api/auth/forgot-password/verify-otp
export const otpVerifySchema = z.object({
  email: collegeEmailSchema,
  otp: z
    .string()
    .length(6, "Enter the full 6-digit OTP")
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

// Client-only — the "New Password" / "Confirm Password" form on
// /reset-password. confirmPassword is stripped before the request body
// is sent to POST /api/auth/reset-password, same pattern as
// wardenCreateFormSchema above.
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// POST /api/auth/reset-password — the reset session (email + resetToken)
// plus the new password, no confirmPassword.
export const resetPasswordApiSchema = z.object({
  email: collegeEmailSchema,
  resetToken: z.string().min(32, "This reset session is invalid."),
  password: passwordSchema,
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type SignupSchema = z.infer<typeof signupSchema>;
export type WardenSchema = z.infer<typeof wardenSchema>;
export type WardenCreateFormSchema = z.infer<typeof wardenCreateFormSchema>;
export type OtpVerifySchema = z.infer<typeof otpVerifySchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordApiSchema = z.infer<typeof resetPasswordApiSchema>;