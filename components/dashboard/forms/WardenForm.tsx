"use client";

// WardenForm.tsx
// One entry point for the warden account form, with two modes:
//   • no `wardenId`  -> CREATE mode: "Create Warden Account" (unchanged
//                       CreateWardenForm, POST /api/wardens)
//   • `wardenId`     -> EDIT mode:   "Edit Warden" / "Update warden account
//                       details" with Save Changes + Cancel
//                       (EditWardenForm, GET/PATCH /api/wardens/:id)
// Both modes render inside the same AuthLayout + AuthCard glass design and
// use the same InputField components, so the two pages look identical.
import { CreateWardenForm } from "@/components/dashboard/forms/CreateWardenForm";
import { EditWardenForm } from "@/components/dashboard/forms/EditWardenForm";

export function WardenForm({ wardenId }: { wardenId?: string }) {
  return wardenId ? <EditWardenForm wardenId={wardenId} /> : <CreateWardenForm />;
}
