import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { getPackById, getPackRatings } from "../../../../../lib/marketplace-service";
import { supabase } from "../../../../../lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await params;

  try {
    const pack = await getPackById(id, session?.user?.id);
    if (!pack) return NextResponse.json({ error: "Pack not found." }, { status: 404 });
    const ratings = await getPackRatings(id);
    return NextResponse.json({ pack, ratings });
  } catch (err) {
    console.error("[GET pack]", err);
    return NextResponse.json({ error: "Failed to load pack." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;

  const allowed = ["title", "description", "price_cents", "cover_color", "preview_moves", "status"];
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (body[key] !== undefined) patch[key] = body[key];
  }

  const { data, error } = await supabase
    .from("packs")
    .update(patch)
    .eq("id", id)
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
