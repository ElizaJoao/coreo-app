import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { deleteSchedule } from "../../../../lib/schedule-service";

type Props = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteSchedule(id, session.user.id);
  return new NextResponse(null, { status: 204 });
}
