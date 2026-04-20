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

export async function sendEmailCode(
  email: string,
  name: string,
  code: string,
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Offbeat Move <onboarding@resend.dev>",
    to: email,
    subject: `Your verification code: ${code}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Hi ${name},</h2>
        <p>Your Offbeat Move verification code is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;margin:24px 0;color:#F5C842">
          ${code}
        </div>
        <p>This code expires in ${VERIFICATION_CODE_EXPIRY_MINUTES} minutes.</p>
        <p style="color:#888;font-size:12px">If you didn't request this, you can ignore this email.</p>
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
    body: `Your Offbeat Move verification code is: ${code}. Expires in ${VERIFICATION_CODE_EXPIRY_MINUTES} minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}
