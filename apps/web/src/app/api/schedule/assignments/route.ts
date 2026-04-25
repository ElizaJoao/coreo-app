import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { getAssignmentsForWeek, upsertAssignment } from "../../../../lib/schedule-service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get("weekStart");
  const weekEnd = searchParams.get("weekEnd");

  if (!weekStart || !weekEnd) {
    return NextResponse.json({ error: "weekStart and weekEnd are required" }, { status: 400 });
  }

  const assignments = await getAssignmentsForWeek(session.user.id, weekStart, weekEnd);
  return NextResponse.json(assignments);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { scheduleId, assignedDate, choreographyId, notes, status } = body;

  if (!scheduleId || !assignedDate) {
    return NextResponse.json({ error: "scheduleId and assignedDate are required" }, { status: 400 });
  }

  const assignment = await upsertAssignment({
    userId: session.user.id,
    scheduleId: String(scheduleId),
    assignedDate: String(assignedDate),
    choreographyId: choreographyId ?? null,
    notes: notes ?? "",
    status: status ?? "scheduled",
  });

  return NextResponse.json(assignment, { status: 201 });
}
