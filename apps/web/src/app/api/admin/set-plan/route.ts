import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { PLANS, type Plan } from "../../../../constants/plans";
import { supabase } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: user } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  if (!(user as { is_admin?: boolean } | null)?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { plan } = (await request.json()) as { plan?: string };
  if (!plan || !(PLANS as readonly string[]).includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  await supabase.from("users").update({ plan }).eq("id", session.user.id);
  return NextResponse.json({ ok: true, plan: plan as Plan });
}
