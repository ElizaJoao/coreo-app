import { createHash } from "crypto";
import { NextResponse } from "next/server";

import { hashPassword } from "../../../../lib/auth-store";
import { supabase } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const { token, password } = (await request.json()) as { token?: string; password?: string };
  if (!token || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password too short" }, { status: 400 });

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { data: row } = await supabase
    .from("password_reset_tokens")
    .select("user_id, expires_at")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!row) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });

  const { user_id } = row as { user_id: string; expires_at: string };
  const passwordHash = await hashPassword(password);

  await supabase.from("users").update({ password_hash: passwordHash }).eq("id", user_id);
  await supabase.from("password_reset_tokens").delete().eq("user_id", user_id);

  return NextResponse.json({ ok: true });
}
