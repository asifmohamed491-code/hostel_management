// student-dashboard-mock.ts
//
// Placeholder UI data for the Student dashboard content area (My Room,
// Attendance, Today's Food, Maintenance Requests, Attendance Overview,
// My Room Details, Recent Notifications, Quick Actions). Mirrors the
// shape of lib/dashboard-mock.tsx (Warden) so it's easy to swap for a
// real API response later — every card reads from one typed export
// here instead of hardcoding values inline.

export const STUDENT_PROFILE = {
  name: "Manikandan",
  registerNo: "2023CSE0124",
  department: "Computer Science",
  year: "3rd",
  block: "Block A",
  room: "214",
};

export const MY_ROOM = {
  block: "Block A",
  room: "214",
  bedOccupied: 2,
  bedTotal: 4,
};

export interface AttendanceStat {
  label: string;
  value: number;
}

export const STUDENT_ATTENDANCE = {
  percentage: 92,
  stats: [
    { label: "Present", value: 45 },
    { label: "Absent", value: 4 },
    { label: "Late", value: 1 },
  ] satisfies AttendanceStat[],
};

export interface FoodMenuItem {
  id: string;
  meal: string;
  menu: string;
  time: string;
  status: "done" | "current" | "upcoming";
}

export const TODAYS_FOOD: FoodMenuItem[] = [
  {
    id: "breakfast",
    meal: "Breakfast",
    menu: "Dosa, Vadai",
    time: "7:30 AM - 9:00 AM",
    status: "done",
  },
  {
    id: "lunch",
    meal: "Lunch",
    menu: "Fish Curry, Rice",
    time: "1:00 PM - 2:00 PM",
    status: "current",
  },
  {
    id: "dinner",
    meal: "Dinner",
    menu: "Veg Biryani",
    time: "7:30 PM - 9:00 PM",
    status: "upcoming",
  },
];

export const MAINTENANCE_REQUESTS = {
  open: 2,
  resolved: 5,
};

export const ATTENDANCE_OVERVIEW_BREAKDOWN = [
  { label: "Present", value: 45, color: "#22C55E" },
  { label: "Absent", value: 4, color: "#EF4444" },
  { label: "Late", value: 1, color: "#F0A420" },
];

export const MY_ROOM_DETAILS = {
  floor: "2nd Floor",
  roommates: [
    { id: "rm-1", name: "Arun V.", bed: "Bed 2", initials: "AV" },
    { id: "rm-2", name: "Rahul S.", bed: "Bed 2", initials: "RS" },
    { id: "rm-3", name: "Vijay K.", bed: "Bed 3", initials: "VK" },
  ],
};

export interface StudentNotification {
  id: string;
  date: string;
  message: string;
  type: "alert" | "event" | "reminder";
}

export const RECENT_NOTIFICATIONS: StudentNotification[] = [
  {
    id: "note-1",
    date: "Sep 05",
    message: "Water maintenance on Sep 7th (2 PM - 6 PM)",
    type: "alert",
  },
  {
    id: "note-2",
    date: "Sep 03",
    message: "Special dinner for Teachers' Day",
    type: "event",
  },
  {
    id: "note-3",
    date: "Aug 28",
    message: "Room inspection tomorrow",
    type: "reminder",
  },
];

export interface StudentQuickAction {
  id: string;
  label: string;
  icon: "room" | "attendance" | "food" | "maintenance" | "feedback" | "rules";
}

export const STUDENT_QUICK_ACTIONS: StudentQuickAction[] = [
  { id: "view-room", label: "View My Room", icon: "room" },
  { id: "mark-attendance", label: "Mark Attendance", icon: "attendance" },
  { id: "food-menu", label: "View Food Menu", icon: "food" },
  { id: "maintenance", label: "Raise Maintenance Request", icon: "maintenance" },
  { id: "food-feedback", label: "Food Feedback", icon: "feedback" },
  { id: "rules", label: "Hostel Rules", icon: "rules" },
];