import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { getPackById, getMyPurchasedPackIds } from "../../../../../../lib/marketplace-service";
import { createChoreography } from "../../../../../../lib/choreography-service";
import type { ChoreographyStyle, ChoreographyDifficulty, ChoreographyDurationMinutes } from "../../../../../../types/choreography";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  const pack = await getPackById(id, userId);
  if (!pack || pack.status !== "published") {
    return NextResponse.json({ error: "Pack not found." }, { status: 404 });
  }

  const isFree = pack.priceCents === 0;
  const isOwn = pack.userId === userId;
  if (!isFree && !isOwn) {
    const purchasedIds = await getMyPurchasedPackIds(userId);
    if (!purchasedIds.includes(id)) {
      return NextResponse.json({ error: "You must purchase this pack first." }, { status: 403 });
    }
  }

  try {
    const choreography = await createChoreography({
      userId,
      name: pack.title,
      style: pack.style as ChoreographyStyle,
      duration: pack.duration as ChoreographyDurationMinutes,
      difficulty: pack.difficulty as ChoreographyDifficulty,
      targetAudience: pack.targetAudience,
      description: pack.description,
      moves: pack.moves,
      music: pack.music,
      tags: [],
      isFavorite: false,
    });

    return NextResponse.json({ choreographyId: choreography.id });
  } catch (err) {
    console.error("[POST import pack]", err);
    return NextResponse.json({ error: "Failed to import pack." }, { status: 500 });
  }
}
