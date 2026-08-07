"use client";

// AddStudentForm.tsx
// Warden's "Add Student" form. Reuses the Signup form's own schema
// (lib/validation.ts -> signupSchema) and posts to the same endpoint the
// public /signup page already uses (POST /api/students) — this is a
// dedicated dashboard page, not a redirect to /signup. All shared
// UI/behavior (glassmorphism card, entrance animation, error/success
// handling, submit button) lives in CreateUserForm; only the field
// configuration is Student-specific.
import {
  CreateUserForm,
  type CreateUserFieldConfig,
} from "@/components/dashboard/forms/CreateUserForm";
import { signupSchema, type SignupSchema } from "@/lib/validation";

const STUDENT_FIELDS: CreateUserFieldConfig<SignupSchema>[] = [
  {
    name: "fullName",
    label: "Full Name",
    iconSrc: "/assets/icons/user.svg",
    placeholder: "Full name",
    autoComplete: "name",
  },
  {
    name: "email",
    label: "College Email",
    iconSrc: "/assets/icons/mail.svg",
    placeholder: "email@oasys.edu.in",
    autoComplete: "email",
  },
  {
    name: "phoneNumber",
    label: "Phone Number",
    iconSrc: "/assets/icons/phone.svg",
    placeholder: "Phone number",
    autoComplete: "tel",
  },
  {
    name: "department",
    label: "Department",
    iconSrc: "/assets/icons/department.svg",
    placeholder: "Department",
    autoComplete: "off",
  },
  {
    name: "year",
    label: "Year",
    iconSrc: "/assets/icons/calendar.svg",
    placeholder: "Year",
    autoComplete: "off",
  },
  {
    name: "roomNumber",
    label: "Room Number",
    iconSrc: "/assets/dashboard/icons/room-icon.svg",
    placeholder: "Room number",
    autoComplete: "off",
  },
  {
    name: "password",
    label: "Password",
    iconSrc: "/assets/icons/lock.svg",
    placeholder: "Create password",
    autoComplete: "new-password",
    isPassword: true,
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    iconSrc: "/assets/icons/lock.svg",
    placeholder: "Confirm password",
    autoComplete: "new-password",
    isPassword: true,
  },
];

const STUDENT_DEFAULT_VALUES: SignupSchema = {
  fullName: "",
  email: "",
  phoneNumber: "",
  department: "",
  year: "",
  roomNumber: "",
  password: "",
  confirmPassword: "",
};

export function AddStudentForm() {
  return (
    <CreateUserForm<SignupSchema>
      heading="Create Student Account"
      subtitle="Create a hostel student account"
      fields={STUDENT_FIELDS}
      schema={signupSchema}
      defaultValues={STUDENT_DEFAULT_VALUES}
      endpoint="/api/students"
      submitLabel="Create Student"
      loadingLabel="Creating student..."
      successMessage="Student account created successfully."
    />
  );
}
