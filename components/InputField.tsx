// InputField.tsx
"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconSrc: string;
  error?: string;
  /** Renders a show/hide toggle and masks the value by default. */
  isPassword?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    { label, iconSrc, error, isPassword = false, id, className, ...rest },
    ref
  ) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? rest.name;
    const type = isPassword ? (visible ? "text" : "password") : rest.type ?? "text";

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-heading/90"
        >
          {label}
        </label>
        <div
          data-float
          className={cn(
            "group relative flex items-center rounded-2xl border border-white/50 bg-white/50 px-4 py-3.5 transition-all duration-300",
            "focus-within:border-primary/60 focus-within:bg-white/70 focus-within:shadow-glass",
            error && "border-red-300 focus-within:border-red-400"
          )}
        >
          <Image
            src={iconSrc}
            alt=""
            width={18}
            height={18}
            className="mr-3 shrink-0 opacity-60"
            aria-hidden
          />
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "w-full bg-transparent text-sm text-heading placeholder:text-heading/35 focus:outline-none",
              // Neutralize the browser's forced opaque autofill background
              // so it can't paint a white rectangle behind typed/suggested text.
              "autofill:bg-transparent autofill:shadow-[0_0_0_1000px_transparent_inset]",
              "[&:-webkit-autofill]:bg-transparent",
              "[&:-webkit-autofill]:shadow-[0_0_0_1000px_transparent_inset]",
              "[&:-webkit-autofill]:[-webkit-text-fill-color:inherit]",
              "[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]",
              className
            )}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((prev) => !prev)}
              className="ml-2 shrink-0 text-heading/40 transition-colors hover:text-primary"
              aria-label={visible ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);