import { randomBytes, createHash } from "crypto";

import { Resend } from "resend";
import twilio from "twilio";

import {
  VERIFICATION_CODE_EXPIRY_MINUTES,
  VERIFICATION_CODE_LENGTH,
  type VerificationMethod,
} from "../constants/auth";
import { supabase } from "./supabase";

type PendingSignupRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  phone: string | null;
  method: VerificationMethod;
  code_hash: string;
  expires_at: string;
};

export function generateCode(): string {
  const bytes = randomBytes(4);
  const num = bytes.readUInt32BE(0) % Math.pow(10, VERIFICATION_CODE_LENGTH);
  return num.toString().padStart(VERIFICATION_CODE_LENGTH, "0");
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function storePendingSignup(input: {
  email: string;
  name: string;
  passwordHash: string;
  phone: string | null;
  method: VerificationMethod;
  codeHash: string;
}): Promise<string> {
  // Remove any existing pending signups for this email
  await supabase.from("pending_signups").delete().eq("email", input.email);

  const expiresAt = new Date(
    Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("pending_signups")
    .insert({
      email: input.email,
      name: input.name,
      password_hash: input.passwordHash,
      phone: input.phone,
      method: input.method,
      code_hash: input.codeHash,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

export async function getPendingSignup(
  id: string,
): Promise<PendingSignupRow | null> {
  const { data, error } = await supabase
    .from("pending_signups")
    .select()
    .eq("id", id)
    .gt("expires_at", new Date().toISOString())
    .single();

  console.log("[getPendingSignup] id:", id, "data:", data, "error:", error);
  return (data as PendingSignupRow) ?? null;
}

export async function deletePendingSignup(id: string): Promise<void> {
  await supabase.from("pending_signups").delete().eq("id", id);
}

type VerificationEmailStrings = {
  subject: (code: string) => string;
  hi: (name: string) => string;
  body: string;
  expires: (minutes: number) => string;
  ignore: string;
};

const VERIFICATION_EMAIL_I18N: Record<string, VerificationEmailStrings> = {
  en: {
    subject: (code) => `Your verification code: ${code}`,
    hi: (name) => `Hi ${name},`,
    body: "Your Offbeat verification code is:",
    expires: (min) => `This code expires in ${min} minutes.`,
    ignore: "If you didn't request this, you can ignore this email.",
  },
  pt: {
    subject: (code) => `O teu código de verificação: ${code}`,
    hi: (name) => `Olá ${name},`,
    body: "O teu código de verificação Offbeat é:",
    expires: (min) => `Este código expira em ${min} minutos.`,
    ignore: "Se não pediste isto, podes ignorar este email.",
  },
  es: {
    subject: (code) => `Tu código de verificación: ${code}`,
    hi: (name) => `Hola ${name},`,
    body: "Tu código de verificación de Offbeat es:",
    expires: (min) => `Este código caduca en ${min} minutos.`,
    ignore: "Si no solicitaste esto, puedes ignorar este correo.",
  },
  fr: {
    subject: (code) => `Votre code de vérification : ${code}`,
    hi: (name) => `Bonjour ${name},`,
    body: "Votre code de vérification Offbeat est :",
    expires: (min) => `Ce code expire dans ${min} minutes.`,
    ignore: "Si vous n'avez pas demandé ceci, vous pouvez ignorer cet email.",
  },
  de: {
    subject: (code) => `Dein Bestätigungscode: ${code}`,
    hi: (name) => `Hallo ${name},`,
    body: "Dein Offbeat-Bestätigungscode lautet:",
    expires: (min) => `Dieser Code läuft in ${min} Minuten ab.`,
    ignore: "Falls du das nicht angefordert hast, kannst du diese E-Mail ignorieren.",
  },
};

export async function sendEmailCode(
  email: string,
  name: string,
  code: string,
  locale = "en",
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const i18n = VERIFICATION_EMAIL_I18N[locale] ?? VERIFICATION_EMAIL_I18N.en;

  await resend.emails.send({
    from: "Offbeat <onboarding@resend.dev>",
    to: email,
    subject: i18n.subject(code),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>${i18n.hi(name)}</h2>
        <p>${i18n.body}</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;margin:24px 0;color:#F5C842">
          ${code}
        </div>
        <p>${i18n.expires(VERIFICATION_CODE_EXPIRY_MINUTES)}</p>
        <p style="color:#888;font-size:12px">${i18n.ignore}</p>
      </div>
    `,
  });
}

export async function sendSmsCode(phone: string, code: string): Promise<void> {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[DEV] SMS code for ${phone}: ${code}`);
    return;
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  await client.messages.create({
    body: `Your Offbeat verification code is: ${code}. Expires in ${VERIFICATION_CODE_EXPIRY_MINUTES} minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}
