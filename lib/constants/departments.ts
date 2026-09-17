// lib/constants/departments.ts
export const DEPARTMENTS = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "AIML",
  "AIDS",
  "CSE(CS)",
  "BME",
  "AUTO",
  "CHEM",
] as const;

export type DepartmentCode = (typeof DEPARTMENTS)[number];

