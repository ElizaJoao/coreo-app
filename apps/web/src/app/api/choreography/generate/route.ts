import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { generateChoreography } from "../../../../lib/choreography-generator";
import { createChoreography } from "../../../../lib/choreography-service";
import type { ChoreographyFormValues } from "../../../../hooks/useChoreographyForm";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as Partial<ChoreographyFormValues>;
  const { style, duration, difficulty, targetAudience, description } = body;

  if (!style || !duration || !difficulty || !targetAudience) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const generated = await generateChoreography({
    style,
    duration,
    difficulty,
    targetAudience,
    description: description ?? "",
  });

  const choreography = await createChoreography({
    userId: session.user.id,
    name: generated.name,
    style,
    duration,
    difficulty,
    targetAudience,
    description: description ?? "",
    moves: generated.moves,
    music: generated.music,
  });

  return NextResponse.json(choreography);
}
