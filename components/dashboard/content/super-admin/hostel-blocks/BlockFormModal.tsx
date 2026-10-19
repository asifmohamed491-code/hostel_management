"use client";

// BlockFormModal.tsx — Add Hostel Block / Edit Hostel Block (one modal).
// Fields: Block Name, Block Code, Description. In edit mode the name is
// read-only (rooms/students/wardens reference the block by name, so a rename
// would orphan them). A block that so far only exists as a name on rooms or
// students (`registered: false`) is "edited" by saving its code/description
// for the first time. The parent performs the API call and returns a server
// error to display, or null on success.
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Lock, Pencil } from "lucide-react";

import { InputField } from "@/components/InputField";
import { RoomModal } from "@/components/dashboard/content/super-admin/rooms/RoomModal";
import { hostelBlockCreateSchema, type HostelBlockFormValues } from "@/lib/hostel-validation";
import type { BlockSummary } from "@/lib/hostel-rooms";

export interface BlockSubmitError {
  message: string;
  field?: "name" | "code" | "description";
}

interface BlockFormModalProps {
  mode: "add" | "edit";
  block?: BlockSummary;
  onClose: () => void;
  onSubmit: (values: HostelBlockFormValues) => Promise<BlockSubmitError | null>;
}

const PRIMARY_BUTTON =
  "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white " +
  "shadow-md shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 " +
  "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-70";

const GLASS_BUTTON =
  "sa-student-action-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 " +
  "text-[13px] font-semibold text-heading/70 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-white hover:text-heading " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-60";

export function BlockFormModal({ mode, block, onClose, onSubmit }: BlockFormModalProps) {
  const isEdit = mode === "edit";
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<HostelBlockFormValues>({
    resolver: zodResolver(hostelBlockCreateSchema),
    defaultValues: {
      name: isEdit && block ? block.name : "",
      code: isEdit && block?.code ? block.code : "",
      description: isEdit && block?.description ? block.description : "",
    },
  });

  async function submit(values: HostelBlockFormValues) {
    setFormError(null);
    setSubmitting(true);
    try {
      const failure = await onSubmit(values);
      if (failure) {
        if (failure.field) setError(failure.field, { message: failure.message });
        else setFormError(failure.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RoomModal
      title={isEdit ? "Edit Hostel Block" : "Add Hostel Block"}
      description={
        isEdit
          ? block?.registered === false
            ? `Add a code and description for ${block.name}`
            : `Update the details of ${block?.name ?? "this block"}`
          : "Register a new hostel block"
      }
      icon={isEdit ? <Pencil className="h-[18px] w-[18px]" /> : <Building2 className="h-[18px] w-[18px]" />}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-3">
        <div>
          <InputField
            label="Block Name"
            iconSrc="/assets/icons/department.svg"
            placeholder="e.g. Block A"
            autoComplete="off"
            readOnly={isEdit}
            data-autofocus={isEdit ? undefined : true}
            className={isEdit ? "cursor-not-allowed text-heading/60" : undefined}
            error={errors.name?.message}
            {...register("name")}
          />
          {isEdit && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-heading/45">
              <Lock className="h-3 w-3" aria-hidden />
              The name can&apos;t be changed because rooms, students and wardens refer to it.
            </p>
          )}
        </div>

        <InputField
          label="Block Code"
          iconSrc="/assets/icons/shield-badge.svg"
          placeholder="e.g. A"
          autoComplete="off"
          data-autofocus={isEdit ? true : undefined}
          error={errors.code?.message}
          {...register("code")}
        />

        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="description" className="text-[12px] font-semibold text-heading/90">
            Description <span className="font-medium text-heading/40">(optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            maxLength={200}
            placeholder="e.g. Boys hostel, north wing"
            className="w-full resize-none rounded-xl border border-white/60 bg-white/50 px-3 py-2.5 text-[12.5px] font-medium text-heading transition-all duration-300 placeholder:text-heading/40 focus:border-primary/60 focus:bg-white/70 focus:shadow-glass focus:outline-none"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-[11px] font-medium text-red-500">{errors.description.message}</p>
          )}
        </div>

        {formError && (
          <p role="alert" className="text-xs font-medium text-red-500">
            {formError}
          </p>
        )}

        <div className="mt-2 flex flex-col-reverse gap-2.5 sm:flex-row">
          <button type="button" onClick={onClose} disabled={submitting} className={GLASS_BUTTON}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={PRIMARY_BUTTON}>
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Hostel Block"}
          </button>
        </div>
      </form>
    </RoomModal>
  );
}
