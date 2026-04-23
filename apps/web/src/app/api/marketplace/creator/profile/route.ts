import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { supabase } from "../../../../../lib/supabase";

type PatchBody = {
  marketplace_enabled?: boolean;
  creator_bio?: string;
  creator_modalities?: string[];
};

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as PatchBody;
  const patch: Record<string, unknown> = {};

  if (body.marketplace_enabled !== undefined) patch.marketplace_enabled = body.marketplace_enabled;
  if (body.creator_bio !== undefined) patch.creator_bio = body.creator_bio;
  if (body.creator_modalities !== undefined) patch.creator_modalities = body.creator_modalities;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update(patch)
    .eq("id", session.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
