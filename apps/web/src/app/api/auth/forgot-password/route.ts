import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import { supabase } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const { data: user } = await supabase
    .from("users")
    .select("id, name")
    .eq("email", email.trim().toLowerCase())
    .single();

  // Always return success to avoid email enumeration
  if (!user) return NextResponse.json({ ok: true });

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await supabase.from("password_reset_tokens").delete().eq("user_id", user.id);
  await supabase.from("password_reset_tokens").insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  const origin = new URL(request.url).origin;
  const resetUrl = `${origin}/reset-password?token=${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
    return NextResponse.json({ ok: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Offbeat <onboarding@resend.dev>",
    to: email,
    subject: "Reset your Offbeat password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Hi ${(user as { name: string }).name},</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#F5C842;color:#000;font-weight:700;border-radius:10px;text-decoration:none">
          Reset password
        </a>
        <p style="color:#888;font-size:12px">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
