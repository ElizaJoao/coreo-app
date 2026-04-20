"use client";

import { useState } from "react";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { AUTH_ERRORS, VERIFICATION_CODE_LENGTH, type VerificationMethod } from "../constants/auth";
import { ROUTES } from "../constants/routes";

export function useVerifyForm(params: {
  pendingId: string;
  method: VerificationMethod;
  destination: string;
  email: string;
  password: string;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const isCodeValid = code.length === VERIFICATION_CODE_LENGTH;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isCodeValid) return;

    setError(undefined);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId: params.pendingId, code }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? AUTH_ERRORS.INVALID_CODE);
        return;
      }

      const result = await signIn("credentials", {
        email: params.email,
        password: params.password,
        redirect: false,
      });

      if (result?.error) {
        setError(AUTH_ERRORS.INVALID_CREDENTIALS);
        return;
      }

      sessionStorage.removeItem("coreo_pending_verify");
      router.push(ROUTES.DASHBOARD);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    setError(undefined);

    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId: params.pendingId }),
      });
    } finally {
      setIsResending(false);
    }
  }

  return {
    code,
    error,
    isSubmitting,
    isResending,
    isCodeValid,
    setCode,
    handleSubmit,
    handleResend,
  };
}
