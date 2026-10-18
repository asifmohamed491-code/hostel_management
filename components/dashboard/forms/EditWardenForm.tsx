"use client";

// EditWardenForm.tsx — EDIT mode of the warden account form (see
// WardenForm.tsx). Same visual pieces as the Create Warden form (AuthCard
// glassmorphism, InputField, gradient submit button, 2-column grid), but it
// first loads the selected warden via GET /api/wardens/:id, pre-fills the
// fields (including the currently assigned hostel block), and saves with
// PATCH /api/wardens/:id.
//
// Editable: Full Name, College Email, Phone Number, Hostel Block
// ("Unassigned" is allowed). There is no password field — a profile edit
// never reads, shows or changes a password or its hash.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import gsap from "gsap";

import { AuthCard } from "@/components/AuthCard";
import { InputField } from "@/components/InputField";
import {
  wardenEditSchema,
  type WardenEditSchema,
} from "@/lib/warden-edit-validation";

const LIST_HREF = "/dashboard/super-admin/wardens";
const REDIRECT_DELAY_MS = 900;

interface LoadedWarden extends WardenEditSchema {
  id: string;
  createdAt: string | null;
}

interface LoadedData {
  warden: LoadedWarden;
  availableBlocks: string[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function LoadingState() {
  return (
    <div aria-busy="true" aria-label="Loading warden" className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200/70" />
            <div className="h-[42px] animate-pulse rounded-xl border border-white/60 bg-white/50" />
          </div>
        ))}
      </div>
      <div className="mt-2 h-10 animate-pulse rounded-xl bg-slate-200/60" />
    </div>
  );
}

function EditForm({
  data,
  onCancel,
}: {
  data: LoadedData;
  onCancel: () => void;
}) {
  const router = useRouter();
  const { warden, availableBlocks } = data;

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WardenEditSchema>({
    resolver: zodResolver(wardenEditSchema),
    defaultValues: {
      fullName: warden.fullName,
      email: warden.email,
      phone: warden.phone,
      hostelBlock: warden.hostelBlock,
    },
  });

  // The warden's saved block stays selectable even if it is no longer in
  // the list, so editing only a name never silently clears it.
  const savedBlockIsListed =
    !warden.hostelBlock || availableBlocks.includes(warden.hostelBlock);

  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const redirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (redirectRef.current) clearTimeout(redirectRef.current);
    },
    []
  );

  async function onSubmit(values: WardenEditSchema) {
    setFormError(null);
    setFormSuccess(null);

    try {
      const response = await fetch(`/api/wardens/${warden.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          hostelBlock: values.hostelBlock,
        }),
      });

      const body = await response.json().catch(() => null);

      // Success is shown ONLY after the API confirmed the database update.
      if (!response.ok) {
        const message = body?.message ?? "Something went wrong. Please try again.";
        if (response.status === 409) {
          setError("email", { message });
        } else if (/hostel block/i.test(message)) {
          setError("hostelBlock", { message });
        } else {
          setFormError(message);
        }
        return;
      }

      setFormSuccess("Warden updated successfully. Redirecting...");
      redirectRef.current = setTimeout(() => {
        router.push(LIST_HREF);
        router.refresh();
      }, REDIRECT_DELAY_MS);
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
  }

  function handleButtonEnter() {
    gsap.to(submitButtonRef.current, {
      scale: 1.02,
      boxShadow: "0 12px 28px rgba(110, 66, 245, 0.35)",
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  function handleButtonLeave() {
    gsap.to(submitButtonRef.current, {
      scale: 1,
      boxShadow: "0 8px 20px rgba(110, 66, 245, 0.22)",
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  const done = Boolean(formSuccess);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-x-3 gap-y-1.5 sm:grid-cols-2">
        <InputField
          label="Full Name"
          iconSrc="/assets/icons/user.svg"
          placeholder="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <InputField
          label="College Email"
          iconSrc="/assets/icons/mail.svg"
          placeholder="email@oasys.edu.in"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <InputField
          label="Phone Number"
          iconSrc="/assets/icons/phone.svg"
          placeholder="Phone number"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />

        {/* Hostel Block — same glass field styling as InputField, as a
            dropdown of the blocks that exist in MongoDB. */}
        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="hostelBlock" className="text-[12px] font-semibold text-heading/90">
            Hostel Block
          </label>
          <div
            className={
              "group relative flex items-center rounded-xl border border-white/60 bg-white/50 px-3 py-2.5 transition-all duration-300 " +
              "focus-within:border-primary/60 focus-within:bg-white/70 focus-within:shadow-glass" +
              (errors.hostelBlock ? " border-red-300 focus-within:border-red-400" : "")
            }
          >
            <Building2 size={16} className="mr-2 shrink-0 text-primary opacity-80" aria-hidden />
            <select
              id="hostelBlock"
              className="w-full bg-transparent text-[12.5px] font-medium text-heading focus:outline-none"
              {...register("hostelBlock")}
            >
              <option value="">Unassigned</option>
              {!savedBlockIsListed && (
                <option value={warden.hostelBlock}>
                  {warden.hostelBlock} (not in current blocks)
                </option>
              )}
              {availableBlocks.map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </div>
          {errors.hostelBlock && (
            <p className="text-[11px] font-medium text-red-500">
              {errors.hostelBlock.message}
            </p>
          )}
        </div>
      </div>

      <p className="text-[11.5px] font-medium text-heading/50">
        Account created {formatDate(warden.createdAt)}. Passwords are managed
        separately and are not changed here.
      </p>

      {formError && (
        <p role="alert" className="text-xs font-medium text-red-500">
          {formError}
        </p>
      )}

      {formSuccess && (
        <p role="status" className="text-xs font-medium text-emerald-600">
          {formSuccess}
        </p>
      )}

      <div className="mt-2 flex flex-col-reverse gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || done}
          className="rounded-xl border border-white/70 bg-white/60 px-5 py-3 text-xs font-semibold text-heading/70 backdrop-blur-md transition-colors hover:bg-white/80 hover:text-heading disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          ref={submitButtonRef}
          type="submit"
          disabled={isSubmitting || done}
          onMouseEnter={handleButtonEnter}
          onMouseLeave={handleButtonLeave}
          className="w-full flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-light py-3 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(110,66,245,0.22)] transition-opacity disabled:opacity-70"
        >
          {isSubmitting ? "Saving changes..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export function EditWardenForm({ wardenId }: { wardenId: string }) {
  const router = useRouter();
  const [data, setData] = useState<LoadedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setData(null);
      setError(null);
      try {
        const res = await fetch(`/api/wardens/${encodeURIComponent(wardenId)}`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            (body && typeof body.message === "string" && body.message) ||
              "Unable to load this warden. Please try again."
          );
        }
        setData(body as LoadedData);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this warden. Please try again."
        );
      }
    }

    void load();
    return () => controller.abort();
  }, [wardenId, reloadKey]);

  const goBack = () => router.push(LIST_HREF);

  return (
    <AuthCard
      heading="Edit Warden"
      subtitle="Update warden account details"
      footer={null}
    >
      {error ? (
        <div className="flex flex-col gap-3">
          <p role="alert" className="text-xs font-medium text-red-500">
            {error}
          </p>
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={goBack}
              className="rounded-xl border border-white/70 bg-white/60 px-5 py-3 text-xs font-semibold text-heading/70 backdrop-blur-md transition-colors hover:bg-white/80 hover:text-heading"
            >
              Back to Manage Wardens
            </button>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="w-full flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-light py-3 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(110,66,245,0.22)]"
            >
              Try again
            </button>
          </div>
        </div>
      ) : data ? (
        <EditForm key={data.warden.id} data={data} onCancel={goBack} />
      ) : (
        <LoadingState />
      )}
    </AuthCard>
  );
}
