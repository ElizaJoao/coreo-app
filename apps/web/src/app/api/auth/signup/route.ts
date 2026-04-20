import { NextResponse } from "next/server";

import { AUTH_ERRORS, VERIFICATION_METHODS, type VerificationMethod } from "../../../../constants/auth";
import { hashPassword } from "../../../../lib/auth-store";
import {
  generateCode,
  hashCode,
  sendEmailCode,
  sendSmsCode,
  storePendingSignup,
} from "../../../../lib/verification-service";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    name?: string;
    password?: string;
    method?: string;
    phone?: string;
  };

  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim();
  const password = String(body.password ?? "");
  const method = String(body.method ?? "") as VerificationMethod;
  const phone = String(body.phone ?? "").trim() || null;

  if (!email || !name || password.length < 8) {
    return NextResponse.json(
      { error: "Provide name, email, and password (min 8 chars)." },
      { status: 400 },
    );
  }

  if (!VERIFICATION_METHODS.includes(method)) {
    return NextResponse.json(
      { error: "Choose a verification method: email or sms." },
      { status: 400 },
    );
  }

  if (method === "sms" && !phone) {
    return NextResponse.json({ error: AUTH_ERRORS.PHONE_REQUIRED }, { status: 400 });
  }

  try {
    const passwordHash = await hashPassword(password);
    const code = generateCode();
    const codeHash = hashCode(code);

    const pendingId = await storePendingSignup({
      email,
      name,
      passwordHash,
      phone,
      method,
      codeHash,
    });

    if (method === "email") {
      await sendEmailCode(email, name, code);
    } else {
      await sendSmsCode(phone!, code);
    }

    return NextResponse.json({ pendingId });
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: AUTH_ERRORS.SEND_FAILED }, { status: 500 });
  }
}
