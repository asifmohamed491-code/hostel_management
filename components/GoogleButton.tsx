"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";

interface GoogleButtonProps {
  label?: string;
  onClick?: () => void;
}

export function GoogleButton({ label = "Continue with Google", onClick }: GoogleButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  function handleEnter() {
    gsap.to(buttonRef.current, {
      y: -2,
      boxShadow: "0 10px 24px rgba(76, 29, 149, 0.14)",
      duration: 0.25,
      ease: "power2.out",
    });
  }

  function handleLeave() {
    gsap.to(buttonRef.current, {
      y: 0,
      boxShadow: "0 2px 8px rgba(76, 29, 149, 0.05)",
      duration: 0.25,
      ease: "power2.out",
    });
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      data-float
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/60 bg-white/70 py-3.5 text-sm font-semibold text-heading transition-colors hover:bg-white"
    >
      <Image src="/assets/icons/google.svg" alt="" width={18} height={18} aria-hidden />
      {label}
    </button>
  );
}
