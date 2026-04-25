import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { generateChoreography } from "../../../../lib/choreography-generator";
import { createChoreography } from "../../../../lib/choreography-service";
import { supabase } from "../../../../lib/supabase";
import type { ChoreographyFormValues } from "../../../../hooks/useChoreographyForm";
import type { Dancer } from "../../../../types/choreography";
import type { Plan } from "../../../../constants/plans";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as Partial<ChoreographyFormValues> & { dancers?: Dancer[] };
  const { style, duration, difficulty, targetAudience, description, dancers } = body;

  if (!style || !duration || !difficulty || !targetAudience) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("plan")
    .eq("id", session.user.id)
    .single();
  const plan = ((userData as { plan?: string } | null)?.plan ?? "free") as Plan;

  const generated = await generateChoreography({
    style, duration, difficulty, targetAudience,
    description: description ?? "",
    plan,
  });

  const choreography = await createChoreography({
    userId: session.user.id,
    name: generated.name,
    style, duration, difficulty, targetAudience,
    description: description ?? "",
    moves: generated.moves,
    music: generated.music,
    dancers: dancers ?? [],
    formations: [],
    tags: [],
    isFavorite: false,
  });

  return NextResponse.json(choreography);
}
