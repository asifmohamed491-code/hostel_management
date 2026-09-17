// lib/constants/departments.ts
export const DEPARTMENTS = [
  "CSE",
  "ECE",
  "EEE",
  "MECH",
  "CSE(AIML)",
  "CIVIL",
  "AIDS",
  "CSBS",
  "MBA",
] as const;

export type DepartmentCode = (typeof DEPARTMENTS)[number];
