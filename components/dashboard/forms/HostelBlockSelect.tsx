"use client";

// HostelBlockSelect.tsx
// The "Hostel Block" dropdown shared by Create Warden and Edit Warden.
// Same glass field styling as InputField, with built-in loading, load
// error (+ retry) and empty states. It forwards its ref and native
// props, so it plugs straight into react-hook-form's `register(...)`.
import { forwardRef, type SelectHTMLAttributes } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface HostelBlockSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  options: string[];
  loading?: boolean;
  loadError?: string | null;
  onRetry?: () => void;
  /** Validation message from the form. */
  error?: string;
  /** Neutral helper text shown under the field. */
  hint?: string;
}

export const HostelBlockSelect = forwardRef<
  HTMLSelectElement,
  HostelBlockSelectProps
>(function HostelBlockSelect(
  {
    label = "Hostel Block",
    options,
    loading = false,
    loadError = null,
    onRetry,
    error,
    hint,
    id,
    ...rest
  },
  ref
) {
  const selectId = id ?? rest.name ?? "hostelBlock";
  const placeholder = loading
    ? "Loading blocks..."
    : loadError
      ? "Unable to load blocks"
      : "Select hostel block";

  return (
    <div className="flex flex-col gap-1 text-left">
      <label htmlFor={selectId} className="text-[12px] font-semibold text-heading/90">
        {label}
      </label>
      <div
        data-float
        className={cn(
          "group relative flex items-center rounded-xl border border-white/60 bg-white/50 px-3 py-2.5 transition-all duration-300",
          "focus-within:border-primary/60 focus-within:bg-white/70 focus-within:shadow-glass",
          error && "border-red-300 focus-within:border-red-400"
        )}
      >
        <Building2 size={16} className="mr-2 shrink-0 text-primary opacity-80" aria-hidden />
        {/* Not natively `disabled` on purpose: react-hook-form reads a
            disabled field as `undefined`, which would turn the friendly
            "Please select a hostel block" message into a generic one. */}
        <select
          ref={ref}
          id={selectId}
          aria-busy={loading}
          aria-invalid={Boolean(error)}
          className="w-full bg-transparent text-[12.5px] font-medium text-heading focus:outline-none"
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((block) => (
            <option key={block} value={block}>
              {block}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}

      {!error && loadError && (
        <p className="text-[11px] font-medium text-red-500">
          {loadError}{" "}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="font-semibold text-primary underline underline-offset-2"
            >
              Retry
            </button>
          )}
        </p>
      )}

      {!error && !loadError && !loading && options.length === 0 && (
        <p className="text-[11px] font-medium text-heading/50">
          No hostel blocks found yet. Add rooms to a block first.
        </p>
      )}

      {!error && !loadError && hint && (
        <p className="text-[11px] font-medium text-amber-600">{hint}</p>
      )}
    </div>
  );
});
