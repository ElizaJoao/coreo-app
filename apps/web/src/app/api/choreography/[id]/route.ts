import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { updateChoreography } from "../../../../lib/choreography-service";
import type { ChoreographyMove, ChoreographyMusic } from "../../../../types/choreography";

type PatchBody = {
  name?: string;
  moves?: ChoreographyMove[];
  music?: ChoreographyMusic | null;
  description?: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as PatchBody;

  try {
    const updated = await updateChoreography(id, session.user.id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH choreography]", err);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
}
