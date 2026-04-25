import type { ClassSchedule, ClassAssignment } from "../types/schedule";
import { supabase } from "./supabase";

type ScheduleRow = {
  id: string;
  user_id: string;
  title: string;
  style: string;
  day_of_week: number;
  time_of_day: string;
  duration_min: number;
  location: string;
  color: string;
  active: boolean;
  created_at: string;
};

type AssignmentRow = {
  id: string;
  user_id: string;
  schedule_id: string;
  assigned_date: string;
  choreography_id: string | null;
  notes: string;
  status: string;
  created_at: string;
};

function rowToSchedule(row: ScheduleRow): ClassSchedule {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    style: row.style,
    dayOfWeek: row.day_of_week,
    timeOfDay: row.time_of_day,
    durationMin: row.duration_min,
    location: row.location,
    color: row.color,
    active: row.active,
    createdAt: row.created_at,
  };
}

function rowToAssignment(row: AssignmentRow): ClassAssignment {
  return {
    id: row.id,
    userId: row.user_id,
    scheduleId: row.schedule_id,
    assignedDate: row.assigned_date,
    choreographyId: row.choreography_id,
    notes: row.notes,
    status: row.status as ClassAssignment["status"],
    createdAt: row.created_at,
  };
}

export async function getSchedulesByUser(userId: string): Promise<ClassSchedule[]> {
  const { data, error } = await supabase
    .from("class_schedules")
    .select()
    .eq("user_id", userId)
    .eq("active", true)
    .order("day_of_week")
    .order("time_of_day");
  if (error) throw new Error(error.message);
  return (data as ScheduleRow[]).map(rowToSchedule);
}

export type CreateScheduleInput = {
  userId: string;
  title: string;
  style: string;
  dayOfWeek: number;
  timeOfDay: string;
  durationMin: number;
  location: string;
  color: string;
};

export async function createSchedule(input: CreateScheduleInput): Promise<ClassSchedule> {
  const { data, error } = await supabase
    .from("class_schedules")
    .insert({
      user_id: input.userId,
      title: input.title,
      style: input.style,
      day_of_week: input.dayOfWeek,
      time_of_day: input.timeOfDay,
      duration_min: input.durationMin,
      location: input.location,
      color: input.color,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToSchedule(data as ScheduleRow);
}

export async function deleteSchedule(id: string, userId: string): Promise<void> {
  await supabase
    .from("class_schedules")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}

export async function getAssignmentsForWeek(
  userId: string,
  weekStart: string,
  weekEnd: string,
): Promise<ClassAssignment[]> {
  const { data, error } = await supabase
    .from("class_assignments")
    .select()
    .eq("user_id", userId)
    .gte("assigned_date", weekStart)
    .lte("assigned_date", weekEnd);
  if (error) throw new Error(error.message);
  return (data as AssignmentRow[]).map(rowToAssignment);
}

export type UpsertAssignmentInput = {
  userId: string;
  scheduleId: string;
  assignedDate: string;
  choreographyId?: string | null;
  notes?: string;
  status?: ClassAssignment["status"];
};

export async function upsertAssignment(input: UpsertAssignmentInput): Promise<ClassAssignment> {
  const { data, error } = await supabase
    .from("class_assignments")
    .upsert(
      {
        user_id: input.userId,
        schedule_id: input.scheduleId,
        assigned_date: input.assignedDate,
        choreography_id: input.choreographyId ?? null,
        notes: input.notes ?? "",
        status: input.status ?? "scheduled",
      },
      { onConflict: "schedule_id,assigned_date" },
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToAssignment(data as AssignmentRow);
}

export async function deleteAssignment(id: string, userId: string): Promise<void> {
  await supabase
    .from("class_assignments")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
