// lib/features.ts
// NOTE: this file wasn't in your provided list but FloatingCards.tsx already
// imports { featureCards } from "@/lib/features" — updating it so the four
// required cards actually render. No other exports/shape changed.
import type { FeatureCardData } from "@/types/auth";

export const featureCards: FeatureCardData[] = [
  {
    id: "attendance",
    label: "Attendance",
    iconSrc: "/assets/icons/attendance.svg",
    positionClassName: "top-[27%] left-[7%]",
    floatDuration: 4.4,
    floatDelay: 0,
    floatDistance: 10,
  },
  {
    id: "room-allocation",
    label: "Room Allocation",
    iconSrc: "/assets/icons/room.svg",
    positionClassName: "top-[29%] left-[58%]",
    floatDuration: 5.2,
    floatDelay: 0.6,
    floatDistance: 12,
  },
  {
    id: "fee-tracking",
    label: "Fee Tracking",
    iconSrc: "/assets/icons/fee.svg",
    positionClassName: "top-[39%] left-[30%]",
    floatDuration: 4.1,
    floatDelay: 1.1,
    floatDistance: 9,
  },
  {
    id: "complaints",
    label: "Complaints",
    iconSrc: "/assets/icons/complaints.svg",
    positionClassName: "top-[50%] left-[62%]",
    floatDuration: 4.8,
    floatDelay: 0.35,
    floatDistance: 11,
  },
];