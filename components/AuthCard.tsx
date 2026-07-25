// AuthCard.tsx
"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/cn";

interface AuthCardProps {
  heading: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  className?: string;
}

export function AuthCard({
  heading,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glowTopRef = useRef<HTMLDivElement | null>(null);
  const glowBottomRef = useRef<HTMLDivElement | null>(null);
  const glowCenterRef = useRef<HTMLDivElement | null>(null);
  const hoverShineRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      // Proxy object driving the box-shadow + border-color strings by
      // hand, so the "increase shadow" and "brighter border" requests
      // interpolate smoothly regardless of GSAP's string-parsing
      // limits on multi-value box-shadow.
      const shadowState = { spread: 30, alpha: 0.16, borderAlpha: 0.6 };

      const applyShadow = () => {
        card.style.boxShadow = `0 ${shadowState.spread + 10}px ${
          shadowState.spread * 3
        }px 0 rgba(76, 29, 149, ${shadowState.alpha}), inset 0 1px 1px 0 rgba(255,255,255,0.7), inset 0 -1px 1px 0 rgba(255,255,255,0.12)`;
        card.style.borderColor = `rgba(255, 255, 255, ${shadowState.borderAlpha})`;
      };
      applyShadow();

      // Blur proxy — animated separately from transform/scale since
      // backdrop-filter isn't a GPU transform property.
      const blurState = { amount: 28 };
      const applyBlur = () => {
        card.style.backdropFilter = `blur(${blurState.amount}px) saturate(180%)`;
        card.style.setProperty(
          "-webkit-backdrop-filter",
          `blur(${blurState.amount}px) saturate(180%)`
        );
      };

      let hoverTl: gsap.core.Timeline | null = null;

      const handlePointerEnter = () => {
        hoverTl?.kill();
        hoverTl = gsap.timeline();

        hoverTl
          .to(
            card,
            {
              y: -6,
              scale: 1.015,
              force3D: true,
              duration: 0.35,
              ease: "power3.out",
            },
            0
          )
          .to(
            shadowState,
            {
              spread: 45,
              alpha: 0.28,
              borderAlpha: 0.85,
              duration: 0.35,
              ease: "power3.out",
              onUpdate: applyShadow,
            },
            0
          )
          .to(
            blurState,
            {
              amount: 34,
              duration: 0.35,
              ease: "power3.out",
              onUpdate: applyBlur,
            },
            0
          )
          .to(
            [glowTopRef.current, glowBottomRef.current],
            {
              opacity: 1,
              scale: 1.08,
              force3D: true,
              duration: 0.35,
              ease: "power3.out",
            },
            0
          )
          .to(
            glowCenterRef.current,
            {
              opacity: 0.85,
              duration: 0.35,
              ease: "power3.out",
            },
            0
          );

        // One-shot shine sweep — reset then play once, never repeats.
        const shine = hoverShineRef.current;
        if (shine) {
          gsap.killTweensOf(shine);
          gsap.set(shine, { xPercent: -150, opacity: 0 });
          gsap
            .timeline()
            .to(shine, { opacity: 1, duration: 0.08, ease: "power1.out" }, 0)
            .to(
              shine,
              {
                xPercent: 220,
                force3D: true,
                duration: 0.7,
                ease: "power2.out",
              },
              0
            )
            .to(shine, { opacity: 0, duration: 0.25, ease: "power1.out" }, 0.35);
        }
      };

      const handlePointerLeave = () => {
        hoverTl?.kill();
        hoverTl = gsap.timeline();

        hoverTl
          .to(
            card,
            {
              y: 0,
              scale: 1,
              force3D: true,
              duration: 0.35,
              ease: "power3.out",
            },
            0
          )
          .to(
            shadowState,
            {
              spread: 30,
              alpha: 0.16,
              borderAlpha: 0.6,
              duration: 0.35,
              ease: "power3.out",
              onUpdate: applyShadow,
            },
            0
          )
          .to(
            blurState,
            {
              amount: 28,
              duration: 0.35,
              ease: "power3.out",
              onUpdate: applyBlur,
            },
            0
          )
          .to(
            [glowTopRef.current, glowBottomRef.current],
            {
              opacity: 0.7,
              scale: 1,
              force3D: true,
              duration: 0.35,
              ease: "power3.out",
            },
            0
          )
          .to(
            glowCenterRef.current,
            {
              opacity: 0.5,
              duration: 0.35,
              ease: "power3.out",
            },
            0
          );
        // Shine is not reversed on leave — it already completed its
        // one-shot sweep, or gets killed mid-flight naturally by the
        // next hover-enter's gsap.killTweensOf call.
      };

      card.addEventListener("pointerenter", handlePointerEnter);
      card.addEventListener("pointerleave", handlePointerLeave);

      return () => {
        card.removeEventListener("pointerenter", handlePointerEnter);
        card.removeEventListener("pointerleave", handlePointerLeave);
      };
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      data-entrance="auth-card"
      style={{ willChange: "transform" }}
      className={cn(
        `
        relative
        overflow-hidden
        w-full
        max-w-[420px]
        rounded-[32px]

        border border-white/20

        bg-white/15

        backdrop-blur-[28px]
        backdrop-saturate-[180%]

        shadow-[0_20px_80px_rgba(109,40,217,0.18)]

     
        px-6
        py-6
        sm:px-8
        sm:py-8
        `,
        className
      )}
    >
      {/* ========================= */}
      {/* Glow Effects */}
      {/* ========================= */}

      <div
        ref={glowTopRef}
        className="absolute -right-6 -top-6 z-0 h-28 w-28 rounded-full bg-gradient-to-br from-primary/70 to-secondary/40 blur-xl opacity-70"
      />

      <div
        ref={glowBottomRef}
        className="absolute -bottom-8 -left-8 z-0 h-24 w-24 rounded-full bg-gradient-to-tr from-primary/50 to-secondary/20 blur-xl opacity-70"
      />

      <div
        ref={glowCenterRef}
        className="absolute left-1/2 top-1/2 z-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-[70px] opacity-50"
      />

      {/* ========================= */}
      {/* Glass Reflection */}
      {/* ========================= */}

      <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/30 via-white/10 to-transparent" />

      <div className="pointer-events-none absolute inset-[1px] rounded-[31px] border border-white/15" />

      <div className="pointer-events-none absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

      {/* Ambient Shine — unchanged, existing looping effect */}

      <div className="pointer-events-none absolute -left-40 top-0 h-full w-40 rotate-12 bg-white/20 opacity-30 blur-3xl animate-[shine_8s_linear_infinite]" />

      {/* Hover Shine — GSAP-driven, one-shot only, fires on pointerenter */}

      <div
        ref={hoverShineRef}
        aria-hidden
        style={{ opacity: 0, willChange: "transform, opacity" }}
        className="pointer-events-none absolute -left-20 top-0 h-full w-24 rotate-12 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-md"
      />

      {/* Noise Texture */}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "8px 8px",
        }}
      />

      {/* ========================= */}
      {/* Content */}
      {/* ========================= */}

      <div className="relative z-10">
        {/* Title Header - Reduced Margin */}
        <div className="mb-4 flex flex-col items-center text-center">
          <h1
            data-entrance="title"
            className="text-2xl sm:text-[26px] font-bold leading-tight text-heading"
          >
            {heading}
          </h1>

          <p
            data-entrance="subtitle"
            className="mt-1 text-xs font-medium text-heading/70"
          >
            {subtitle}
          </p>
        </div>

        {/* Form Body - Reduced Gap */}
        <div className="flex flex-col gap-3">{children}</div>

        {/* Already have an account link - Reduced Margin */}
        <div className="mt-3 flex flex-col items-center gap-2">{footer}</div>

        {/* SOC 2 Badge - Reduced Margin & Padding */}
        <div className="mt-4 flex justify-center">
          <div
            data-entrance="footer"
            className="
              flex
              items-center
              gap-1.5
              rounded-full
              border
              border-white/30
              bg-white/20
              px-3.5
              py-1.5
              text-[9px]
              font-semibold
              uppercase
              tracking-wide
              text-heading/70
              backdrop-blur-xl
            "
          >
            <Image
              src="/assets/icons/shield-badge.svg"
              alt=""
              width={12}
              height={12}
              aria-hidden
            />
            SOC 2 COMPLIANT · SECURE ACCESS
          </div>
        </div>
      </div>
    </div>
  );
}