// scripts/seed-demo-hostel.ts
//
// OASYS Hostel Management System - Final Demo Data Setup
// Seeds 18 demo student accounts and 5 demo rooms into MongoDB.
// Idempotent: safe to run multiple times without creating duplicates.
import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../lib/mongodb";
import { User } from "../models/User";
import { Room } from "../models/Room";

const DEMO_PASSWORD_PLAIN = "OasysDemo@2026!";

export const DEMO_ROOMS = [
  { roomNumber: "A-101", hostelBlock: "Block A", capacity: 4 },
  { roomNumber: "A-102", hostelBlock: "Block A", capacity: 4 },
  { roomNumber: "B-201", hostelBlock: "Block B", capacity: 4 },
  { roomNumber: "B-202", hostelBlock: "Block B", capacity: 4 },
  { roomNumber: "C-301", hostelBlock: "Block C", capacity: 4 },
];

export const DEMO_STUDENTS = [
  // Block A - A-101 (4 students)
  {
    fullName: "Mohamed Asif",
    registerNumber: "812924104001",
    email: "mhdasif2603@gmail.com",
    phone: "9876543210",
    department: "CSE",
    year: "III",
    hostelBlock: "Block A",
    roomNumber: "A-101",
    role: "student" as const,
  },
  {
    fullName: "Mani Kumar",
    registerNumber: "812924104002",
    email: "812924104002@oasys.edu.in",
    phone: "9876543211",
    department: "CSE",
    year: "III",
    hostelBlock: "Block A",
    roomNumber: "A-101",
    role: "student" as const,
  },
  {
    fullName: "Manikandan",
    registerNumber: "812924104003",
    email: "812924104003@oasys.edu.in",
    phone: "9876543212",
    department: "AIML",
    year: "II",
    hostelBlock: "Block A",
    roomNumber: "A-101",
    role: "student" as const,
  },
  {
    fullName: "Manmohan S",
    registerNumber: "812924104004",
    email: "812924104004@oasys.edu.in",
    phone: "9876543213",
    department: "IT",
    year: "II",
    hostelBlock: "Block A",
    roomNumber: "A-101",
    role: "student" as const,
  },

  // Block A - A-102 (4 students)
  {
    fullName: "Rahul Kumar",
    registerNumber: "812924104005",
    email: "812924104005@oasys.edu.in",
    phone: "9876543214",
    department: "ECE",
    year: "IV",
    hostelBlock: "Block A",
    roomNumber: "A-102",
    role: "student" as const,
  },
  {
    fullName: "Priya Sharma",
    registerNumber: "812924104006",
    email: "812924104006@oasys.edu.in",
    phone: "9876543215",
    department: "CSE",
    year: "III",
    hostelBlock: "Block A",
    roomNumber: "A-102",
    role: "student" as const,
  },
  {
    fullName: "Arun Prakash",
    registerNumber: "812924104007",
    email: "812924104007@oasys.edu.in",
    phone: "9876543216",
    department: "EEE",
    year: "I",
    hostelBlock: "Block A",
    roomNumber: "A-102",
    role: "student" as const,
  },
  {
    fullName: "Sneha R",
    registerNumber: "812924104008",
    email: "812924104008@oasys.edu.in",
    phone: "9876543217",
    department: "IT",
    year: "I",
    hostelBlock: "Block A",
    roomNumber: "A-102",
    role: "student" as const,
  },

  // Block B - B-201 (4 students)
  {
    fullName: "Vignesh S",
    registerNumber: "812924104009",
    email: "812924104009@oasys.edu.in",
    phone: "9876543218",
    department: "CSE",
    year: "III",
    hostelBlock: "Block B",
    roomNumber: "B-201",
    role: "student" as const,
  },
  {
    fullName: "Kavya M",
    registerNumber: "812924104010",
    email: "812924104010@oasys.edu.in",
    phone: "9876543219",
    department: "AIML",
    year: "II",
    hostelBlock: "Block B",
    roomNumber: "B-201",
    role: "student" as const,
  },
  {
    fullName: "Sanjay K",
    registerNumber: "812924104011",
    email: "812924104011@oasys.edu.in",
    phone: "9876543220",
    department: "ECE",
    year: "IV",
    hostelBlock: "Block B",
    roomNumber: "B-201",
    role: "student" as const,
  },
  {
    fullName: "Harini S",
    registerNumber: "812924104012",
    email: "812924104012@oasys.edu.in",
    phone: "9876543221",
    department: "IT",
    year: "II",
    hostelBlock: "Block B",
    roomNumber: "B-201",
    role: "student" as const,
  },

  // Block B - B-202 (2 students)
  {
    fullName: "Dinesh Kumar",
    registerNumber: "812924104013",
    email: "812924104013@oasys.edu.in",
    phone: "9876543222",
    department: "EEE",
    year: "I",
    hostelBlock: "Block B",
    roomNumber: "B-202",
    role: "student" as const,
  },
  {
    fullName: "Nithin Raj",
    registerNumber: "812924104014",
    email: "812924104014@oasys.edu.in",
    phone: "9876543223",
    department: "CSE",
    year: "I",
    hostelBlock: "Block B",
    roomNumber: "B-202",
    role: "student" as const,
  },

  // Block C - C-301 (4 students)
  {
    fullName: "Keerthana M",
    registerNumber: "812924104015",
    email: "812924104015@oasys.edu.in",
    phone: "9876543224",
    department: "AIML",
    year: "III",
    hostelBlock: "Block C",
    roomNumber: "C-301",
    role: "student" as const,
  },
  {
    fullName: "Ajay Kumar",
    registerNumber: "812924104016",
    email: "812924104016@oasys.edu.in",
    phone: "9876543225",
    department: "ECE",
    year: "III",
    hostelBlock: "Block C",
    roomNumber: "C-301",
    role: "student" as const,
  },
  {
    fullName: "Dharani S",
    registerNumber: "812924104017",
    email: "812924104017@oasys.edu.in",
    phone: "9876543226",
    department: "IT",
    year: "II",
    hostelBlock: "Block C",
    roomNumber: "C-301",
    role: "student" as const,
  },
  {
    fullName: "Karthik R",
    registerNumber: "812924104018",
    email: "812924104018@oasys.edu.in",
    phone: "9876543227",
    department: "CSE",
    year: "IV",
    hostelBlock: "Block C",
    roomNumber: "C-301",
    role: "student" as const,
  },
];

export async function seedDemoHostel() {
  await connectToDatabase();

  console.log("=== SEEDING DEMO ROOMS ===");
  let roomsInserted = 0;
  let roomsUpdated = 0;

  for (const r of DEMO_ROOMS) {
    const existing = await Room.findOne({ roomNumber: r.roomNumber });
    if (existing) {
      existing.hostelBlock = r.hostelBlock;
      existing.capacity = r.capacity;
      await existing.save();
      roomsUpdated++;
    } else {
      await Room.create(r);
      roomsInserted++;
    }
  }
  console.log(`Rooms: ${roomsInserted} inserted, ${roomsUpdated} updated (Total: ${DEMO_ROOMS.length})`);

  let studentsInserted = 0;
  let studentsUpdated = 0;

  for (const s of DEMO_STUDENTS) {
    // Check by email or registerNumber
    const existing = await User.findOne({
      $or: [{ email: s.email.toLowerCase() }, { registerNumber: s.registerNumber }],
    });

    if (existing) {
      existing.fullName = s.fullName;
      existing.email = s.email.toLowerCase();
      existing.phone = s.phone;
      existing.department = s.department;
      existing.year = s.year;
      existing.hostelBlock = s.hostelBlock;
      existing.roomNumber = s.roomNumber;
      existing.registerNumber = s.registerNumber;
      existing.role = s.role;
      existing.password = DEMO_PASSWORD_PLAIN;
      await existing.save();
      studentsUpdated++;
    } else {
      await User.create({
        ...s,
        email: s.email.toLowerCase(),
        password: DEMO_PASSWORD_PLAIN,
      });
      studentsInserted++;
    }
  }
  console.log(`Students: ${studentsInserted} inserted, ${studentsUpdated} updated (Total: ${DEMO_STUDENTS.length})`);

  // Verification queries
  const totalStudents = await User.countDocuments({ role: "student" });
  const totalRooms = await Room.countDocuments({});
  const allRooms = await Room.find({}).lean();
  const totalCapacity = allRooms.reduce((sum, r) => sum + (r.capacity || 4), 0);
  const occupiedStudents = await User.countDocuments({
    role: "student",
    roomNumber: { $exists: true, $ne: "" },
  });
  const occupancyPct = totalCapacity > 0 ? (occupiedStudents / totalCapacity) * 100 : 0;

  console.log("\n=== VERIFICATION SUMMARY ===");
  console.log(`Total Students in DB: ${totalStudents}`);
  console.log(`Total Rooms in DB: ${totalRooms}`);
  console.log(`Total Room Capacity: ${totalCapacity}`);
  console.log(`Occupied Students: ${occupiedStudents}`);
  console.log(`Calculated Room Occupancy: ${occupancyPct.toFixed(1)}%`);

  return {
    totalStudents,
    totalRooms,
    totalCapacity,
    occupiedStudents,
    occupancyPct,
  };
}

if (require.main === module) {
  seedDemoHostel()
    .catch((error) => {
      console.error("Failed to seed demo hostel data:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}
