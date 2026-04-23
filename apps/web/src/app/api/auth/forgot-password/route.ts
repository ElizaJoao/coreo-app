import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import { supabase } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const { data: user } = await supabase
    .from("users")
    .select("id, name, locale")
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

  const RESET_EMAIL_I18N: Record<string, { subject: string; hi: string; body: string; btn: string; ignore: string }> = {
    en: { subject: "Reset your Offbeat password", hi: `Hi ${(user as { name: string }).name},`, body: "Click the button below to reset your password. This link expires in 1 hour.", btn: "Reset password", ignore: "If you didn't request this, you can ignore this email." },
    pt: { subject: "Redefine a tua password Offbeat", hi: `Olá ${(user as { name: string }).name},`, body: "Clica no botão abaixo para redefinir a tua password. Este link expira em 1 hora.", btn: "Redefinir password", ignore: "Se não pediste isto, podes ignorar este email." },
    es: { subject: "Restablece tu contraseña de Offbeat", hi: `Hola ${(user as { name: string }).name},`, body: "Haz clic en el botón de abajo para restablecer tu contraseña. Este enlace caduca en 1 hora.", btn: "Restablecer contraseña", ignore: "Si no solicitaste esto, puedes ignorar este correo." },
    fr: { subject: "Réinitialisez votre mot de passe Offbeat", hi: `Bonjour ${(user as { name: string }).name},`, body: "Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe. Ce lien expire dans 1 heure.", btn: "Réinitialiser le mot de passe", ignore: "Si vous n'avez pas demandé ceci, vous pouvez ignorer cet email." },
    de: { subject: "Setze dein Offbeat-Passwort zurück", hi: `Hallo ${(user as { name: string }).name},`, body: "Klicke auf den Button unten, um dein Passwort zurückzusetzen. Dieser Link läuft in 1 Stunde ab.", btn: "Passwort zurücksetzen", ignore: "Falls du das nicht angefordert hast, kannst du diese E-Mail ignorieren." },
  };
  const userLocale = (user as { locale?: string }).locale ?? "en";
  const i18n = RESET_EMAIL_I18N[userLocale] ?? RESET_EMAIL_I18N.en;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Offbeat <onboarding@resend.dev>",
    to: email,
    subject: i18n.subject,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>${i18n.hi}</h2>
        <p>${i18n.body}</p>
        <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#F5C842;color:#000;font-weight:700;border-radius:10px;text-decoration:none">
          ${i18n.btn}
        </a>
        <p style="color:#888;font-size:12px">${i18n.ignore}</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
