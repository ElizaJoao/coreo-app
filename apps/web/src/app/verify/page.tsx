"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import { VerifyForm } from "../../components/VerifyForm";
import { type VerificationMethod } from "../../constants/auth";
import { ROUTES } from "../../constants/routes";
import { useVerifyForm } from "../../hooks/useVerifyForm";

const SESSION_KEY = "coreo_pending_verify";

export type PendingVerifySession = {
  email: string;
  password: string;
};

export function savePendingVerifySession(data: PendingVerifySession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function clearPendingVerifySession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function VerifyPage() {
  const params = useSearchParams();
  const [session, setSession] = useState<PendingVerifySession | null>(null);
  const [ready, setReady] = useState(false);

  const pendingId = params.get("id") ?? "";
  const method = (params.get("method") ?? "email") as VerificationMethod;
  const destination = params.get("dest") ?? "";

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      setSession(JSON.parse(raw) as PendingVerifySession);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && (!pendingId || !destination || !session)) {
      window.location.href = ROUTES.SIGNUP;
    }
  }, [ready, pendingId, destination, session]);

  const form = useVerifyForm({
    pendingId,
    method,
    destination,
    email: session?.email ?? "",
    password: session?.password ?? "",
  });

  if (!ready || !session) return null;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <VerifyForm
          method={method}
          destination={destination}
          code={form.code}
          error={form.error}
          isSubmitting={form.isSubmitting}
          isResending={form.isResending}
          isCodeValid={form.isCodeValid}
          onCodeChange={form.setCode}
          onSubmit={form.handleSubmit}
          onResend={form.handleResend}
        />
      </div>
    </main>
  );
}
