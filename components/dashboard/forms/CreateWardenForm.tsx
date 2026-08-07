"use client";

// CreateWardenForm.tsx
// Super Admin's "Create Warden" form. Posts to POST /api/wardens, which
// validates against the existing, untouched `wardenSchema` in
// lib/validation.ts (no confirmPassword field). The UI still shows a
// Confirm Password field for the usual "did I type my password right"
// check, backed by `wardenCreateFormSchema` — an additive, client-only
// schema that extends wardenSchema with a matching confirmPassword
// check. confirmPassword is stripped via `toRequestBody` before the
// request is sent, so the API's own schema and route logic are
// untouched. All shared UI/behavior lives in CreateUserForm; only the
// field configuration and body transform are Warden-specific.
import {
  CreateUserForm,
  type CreateUserFieldConfig,
} from "@/components/dashboard/forms/CreateUserForm";
import {
  wardenCreateFormSchema,
  type WardenCreateFormSchema,
} from "@/lib/validation";

const WARDEN_FIELDS: CreateUserFieldConfig<WardenCreateFormSchema>[] = [
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
    name: "phone",
    label: "Phone Number",
    iconSrc: "/assets/icons/phone.svg",
    placeholder: "Phone number",
    autoComplete: "tel",
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

const WARDEN_DEFAULT_VALUES: WardenCreateFormSchema = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export function CreateWardenForm() {
  return (
    <CreateUserForm<WardenCreateFormSchema>
      heading="Create Warden Account"
      subtitle="Create a hostel warden account"
      fields={WARDEN_FIELDS}
      schema={wardenCreateFormSchema}
      defaultValues={WARDEN_DEFAULT_VALUES}
      endpoint="/api/wardens"
      submitLabel="Create Warden"
      loadingLabel="Creating warden..."
      successMessage="Warden account created successfully."
      toRequestBody={(values) => {
        const { confirmPassword, ...rest } = values;
        void confirmPassword;
        return rest;
      }}
    />
  );
}
