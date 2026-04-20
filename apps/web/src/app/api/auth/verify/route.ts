import { NextResponse } from "next/server";

import { AUTH_ERRORS } from "../../../../constants/auth";
import { createUserFromHash } from "../../../../lib/auth-store";
import {
  deletePendingSignup,
  getPendingSignup,
  hashCode,
} from "../../../../lib/verification-service";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    pendingId?: string;
    code?: string;
  };

  const pendingId = String(body.pendingId ?? "").trim();
  const code = String(body.code ?? "").trim();

  if (!pendingId || !code) {
    return NextResponse.json({ error: "Pending ID and code are required." }, { status: 400 });
  }

  const pending = await getPendingSignup(pendingId);

  if (!pending) {
    console.error("[verify] pending signup not found or expired:", pendingId);
    return NextResponse.json({ error: "Verification session expired. Please sign up again." }, { status: 400 });
  }

  const computedHash = hashCode(code);
  console.log("[verify] submitted code:", JSON.stringify(code), "length:", code.length);
  console.log("[verify] stored hash:", pending.code_hash);
  console.log("[verify] computed hash:", computedHash);
  if (pending.code_hash !== computedHash) {
    console.error("[verify] code mismatch for pendingId:", pendingId);
    return NextResponse.json({ error: AUTH_ERRORS.INVALID_CODE }, { status: 400 });
  }

  try {
    const user = await createUserFromHash({
      email: pending.email,
      name: pending.name,
      passwordHash: pending.password_hash,
    });

    await deletePendingSignup(pendingId);

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch {
    return NextResponse.json({ error: AUTH_ERRORS.USER_EXISTS }, { status: 409 });
  }
}
