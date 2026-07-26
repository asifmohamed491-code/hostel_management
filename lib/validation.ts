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

export type LoginSchema = z.infer<typeof loginSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type SignupSchema = z.infer<typeof signupSchema>;
