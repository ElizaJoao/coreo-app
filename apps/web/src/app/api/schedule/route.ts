import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { getSchedulesByUser, createSchedule } from "../../../lib/schedule-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const schedules = await getSchedulesByUser(session.user.id);
  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, style, dayOfWeek, timeOfDay, durationMin, location, color } = body;

  if (!title || dayOfWeek === undefined) {
    return NextResponse.json({ error: "title and dayOfWeek are required" }, { status: 400 });
  }

  const schedule = await createSchedule({
    userId: session.user.id,
    title: String(title),
    style: String(style ?? ""),
    dayOfWeek: Number(dayOfWeek),
    timeOfDay: String(timeOfDay ?? "09:00"),
    durationMin: Number(durationMin ?? 60),
    location: String(location ?? ""),
    color: String(color ?? "#e8c45d"),
  });

  return NextResponse.json(schedule, { status: 201 });
}
