"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconSrc: string;
  iconClassName?: string;
  error?: string;
  isPassword?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    { label, iconSrc, iconClassName, error, isPassword = false, id, className, ...rest },
    ref
  ) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? rest.name;
    const type = isPassword ? (visible ? "text" : "password") : rest.type ?? "text";

    return (
      <div className="flex flex-col gap-1 text-left">
        <label
          htmlFor={inputId}
          className="text-[12px] font-semibold text-heading/90"
        >
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
          <Image
            src={iconSrc}
            alt=""
            width={16}
            height={16}
            className={cn(
              "mr-2 shrink-0 opacity-80",
              iconClassName ?? "[filter:invert(32%)_sepia(85%)_saturate(2421%)_hue-rotate(245deg)_brightness(98%)_contrast(98%)]"
            )}
            aria-hidden
          />
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "w-full bg-transparent text-[12.5px] font-medium text-heading placeholder:text-heading/40 focus:outline-none",
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
              className="ml-1.5 shrink-0 text-heading/40 transition-colors hover:text-primary"
              aria-label={visible ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);