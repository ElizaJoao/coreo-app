"use client";

import { useMemo, useState } from "react";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { AUTH_ERRORS, type VerificationMethod } from "../constants/auth";
import { ROUTES } from "../constants/routes";

type Mode = "login" | "signup";

type Values = {
  name: string;
  email: string;
  password: string;
  method: VerificationMethod;
  phone: string;
};

type Touched = Record<keyof Values, boolean>;
type Errors = Partial<Record<keyof Values, string>> & { form?: string };

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone: string): string {
  return phone.slice(0, -4).replace(/\d/g, "*") + phone.slice(-4);
}

function validate(mode: Mode, values: Values): Errors {
  const errors: Errors = {};

  if (mode === "signup") {
    if (values.name.trim().length < 2) {
      errors.name = "Name must have at least 2 characters.";
    }
    if (values.method === "sms" && values.phone.trim().length < 7) {
      errors.phone = "Enter a valid phone number.";
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(values.email.trim())) {
    errors.email = "Enter a valid email.";
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  if (!passwordRegex.test(values.password)) {
    errors.password = "Use 8+ chars with upper, lower, number, and symbol.";
  }

  return errors;
}

export function useAuthForm(mode: Mode) {
  const router = useRouter();
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    password: "",
    method: "email",
    phone: "",
  });
  const [touched, setTouched] = useState<Touched>({
    name: false,
    email: false,
    password: false,
    method: false,
    phone: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();

  const baseErrors = useMemo(() => validate(mode, values), [mode, values]);
  const isFormValid = useMemo(() => Object.keys(baseErrors).length === 0, [baseErrors]);

  const visibleFieldErrors = useMemo(() => {
    const next: Partial<Record<keyof Values, string>> = {};
    (Object.keys(baseErrors) as Array<keyof Values>).forEach((key) => {
      if (submitAttempted || touched[key]) {
        next[key] = baseErrors[key];
      }
    });
    return next;
  }, [baseErrors, submitAttempted, touched]);

  const errors = useMemo(
    () => ({ ...visibleFieldErrors, form: formError }),
    [visibleFieldErrors, formError],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(undefined);
    setSubmitAttempted(true);
    setTouched({ name: true, email: true, password: true, method: true, phone: true });

    const validation = validate(mode, values);
    if (Object.keys(validation).length > 0) return;

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
            method: values.method,
            phone: values.phone || undefined,
          }),
        });

        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          setFormError(body.error ?? AUTH_ERRORS.SIGNUP_FAILED);
          return;
        }

        const { pendingId } = (await response.json()) as { pendingId: string };

        // Store credentials in sessionStorage — never in the URL
        import("../lib/pending-verify-session").then(({ savePendingVerifySession }) => {
          savePendingVerifySession({ email: values.email, password: values.password });
        });

        const destination =
          values.method === "email" ? maskEmail(values.email) : maskPhone(values.phone);

        const url = new URL(ROUTES.VERIFY, window.location.origin);
        url.searchParams.set("id", pendingId);
        url.searchParams.set("method", values.method);
        url.searchParams.set("dest", destination);

        router.push(url.pathname + url.search);
        return;
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setFormError(AUTH_ERRORS.INVALID_CREDENTIALS);
        return;
      }

      router.push(ROUTES.DASHBOARD);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    values,
    errors,
    isFormValid,
    isSubmitting,
    setName: (name: string) => setValues((prev) => ({ ...prev, name })),
    setEmail: (email: string) => setValues((prev) => ({ ...prev, email })),
    setPassword: (password: string) => setValues((prev) => ({ ...prev, password })),
    setMethod: (method: VerificationMethod) => setValues((prev) => ({ ...prev, method })),
    setPhone: (phone: string) => setValues((prev) => ({ ...prev, phone })),
    touchName: () => setTouched((prev) => ({ ...prev, name: true })),
    touchEmail: () => setTouched((prev) => ({ ...prev, email: true })),
    touchPassword: () => setTouched((prev) => ({ ...prev, password: true })),
    touchPhone: () => setTouched((prev) => ({ ...prev, phone: true })),
    handleSubmit,
  };
}
