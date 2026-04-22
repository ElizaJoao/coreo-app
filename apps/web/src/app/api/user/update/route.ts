import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { supabase } from "../../../../lib/supabase";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim();
  if (!name || name.length < 1) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const { error } = await supabase
    .from("users")
    .update({ name })
    .eq("id", session.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
