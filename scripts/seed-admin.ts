// scripts/seed-admin.ts
// Seeds a single Super Admin account. Run with: npm run seed:admin
// Safe to re-run — if a Super Admin already exists, nothing happens.
import { config } from "dotenv";

config({ path: ".env.local" });

import mongoose from "mongoose";
import { connectToDatabase } from "../lib/mongodb";
import { User } from "../models/User";

const SUPER_ADMIN = {
  fullName: "Hostel Administrator",
  email: "admin@oasys.edu.in",
  // Hashed automatically by the User model's pre-save hook (bcrypt),
  // same logic used everywhere else in the app.
  password: "Admin@123",
  role: "super_admin" as const,
};

async function seedSuperAdmin() {
  await connectToDatabase();

  const existing = await User.findOne({ role: "super_admin" });

  if (existing) {
    console.log(`Super Admin already exists (${existing.email}). Skipping.`);
    return;
  }

  const admin = await User.create(SUPER_ADMIN);
  console.log(`Super Admin created successfully: ${admin.email}`);
}

seedSuperAdmin()
  .catch((error) => {
    console.error("Failed to seed Super Admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
