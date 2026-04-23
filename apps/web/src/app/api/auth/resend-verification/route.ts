import { NextResponse } from "next/server";

import { AUTH_ERRORS } from "../../../../constants/auth";
import {
  generateCode,
  getPendingSignup,
  hashCode,
  sendEmailCode,
  sendSmsCode,
  storePendingSignup,
} from "../../../../lib/verification-service";

export async function POST(request: Request) {
  const body = (await request.json()) as { pendingId?: string };
  const pendingId = String(body.pendingId ?? "").trim();

  if (!pendingId) {
    return NextResponse.json({ error: "Pending ID is required." }, { status: 400 });
  }

  const pending = await getPendingSignup(pendingId);
  if (!pending) {
    return NextResponse.json({ error: AUTH_ERRORS.INVALID_CODE }, { status: 400 });
  }

  try {
    const code = generateCode();
    const codeHash = hashCode(code);

    const newPendingId = await storePendingSignup({
      email: pending.email,
      name: pending.name,
      passwordHash: pending.password_hash,
      phone: pending.phone,
      method: pending.method,
      codeHash,
    });

    const cookieHeader = request.headers.get("cookie") ?? "";
    const localeCookie = cookieHeader.match(/NEXT_LOCALE=([a-z]{2})/)?.[1] ?? "en";

    if (pending.method === "email") {
      await sendEmailCode(pending.email, pending.name, code, localeCookie);
    } else {
      await sendSmsCode(pending.phone!, code);
    }

    return NextResponse.json({ pendingId: newPendingId });
  } catch {
    return NextResponse.json({ error: AUTH_ERRORS.SEND_FAILED }, { status: 500 });
  }
}
