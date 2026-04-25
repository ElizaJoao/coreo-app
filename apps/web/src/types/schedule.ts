export type ClassSchedule = {
  id: string;
  userId: string;
  title: string;
  style: string;
  dayOfWeek: number; // 0=Mon, 6=Sun
  timeOfDay: string; // "HH:MM"
  durationMin: number;
  location: string;
  color: string;
  active: boolean;
  createdAt: string;
};

export type ClassAssignment = {
  id: string;
  userId: string;
  scheduleId: string;
  assignedDate: string; // "YYYY-MM-DD"
  choreographyId: string | null;
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
};
