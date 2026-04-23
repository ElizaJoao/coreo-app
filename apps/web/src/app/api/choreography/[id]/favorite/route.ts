import { NextResponse } from "next/server";

import { auth } from "../../../../../auth";
import { toggleFavorite } from "../../../../../lib/choreography-service";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const isFavorite = await toggleFavorite(id, session.user.id);
    return NextResponse.json({ isFavorite });
  } catch (err) {
    console.error("[PATCH favorite]", err);
    return NextResponse.json({ error: "Failed to update favorite." }, { status: 500 });
  }
}
