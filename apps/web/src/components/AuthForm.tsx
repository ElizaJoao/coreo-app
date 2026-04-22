"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";

import { type VerificationMethod } from "../constants/auth";
import styles from "./AuthForm.module.css";

export type AuthFormValues = {
  name?: string;
  email: string;
  password: string;
  method?: VerificationMethod;
  phone?: string;
};

export type AuthFormProps = {
  mode: "login" | "signup";
  values: AuthFormValues;
  errors?: Partial<Record<keyof AuthFormValues, string>> & { form?: string };
  isFormValid: boolean;
  isSubmitting: boolean;
  onNameChange?: (value: string) => void;
  onNameBlur?: () => void;
  onEmailChange: (value: string) => void;
  onEmailBlur?: () => void;
  onPasswordChange: (value: string) => void;
  onPasswordBlur?: () => void;
  onMethodChange?: (method: VerificationMethod) => void;
  onPhoneChange?: (value: string) => void;
  onPhoneBlur?: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export function AuthForm(props: AuthFormProps) {
  const isSignup = props.mode === "signup";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={props.onSubmit} className={styles.form}>
      <h1 className={styles.title}>{isSignup ? "Create account" : "Sign in"}</h1>
      <p className={styles.subtitle}>
        {isSignup ? "Start building choreographies." : "Welcome back to Offbeat Move."}
      </p>

      <div className={styles.fields}>
        {isSignup ? (
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input
              value={props.values.name ?? ""}
              onChange={(e) => props.onNameChange?.(e.target.value)}
              onBlur={props.onNameBlur}
              className={styles.input}
              placeholder="Your name"
            />
            {props.errors?.name ? <p className={styles.fieldError}>{props.errors.name}</p> : null}
          </div>
        ) : null}

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={props.values.email}
            onChange={(e) => props.onEmailChange(e.target.value)}
            onBlur={props.onEmailBlur}
            className={styles.input}
            placeholder="you@example.com"
          />
          {props.errors?.email ? <p className={styles.fieldError}>{props.errors.email}</p> : null}
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Password</label>
            {!isSignup && (
              <Link href="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            )}
          </div>
          <div className={styles.passwordWrap}>
            <input
              type={showPassword ? "text" : "password"}
              value={props.values.password}
              onChange={(e) => props.onPasswordChange(e.target.value)}
              onBlur={props.onPasswordBlur}
              className={styles.input}
              placeholder="••••••••"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
          {isSignup && <p className={styles.hint}>Must be 8+ chars with uppercase, lowercase, number, and symbol.</p>}
          {props.errors?.password ? <p className={styles.fieldError}>{props.errors.password}</p> : null}
        </div>

        {isSignup ? (
          <div className={styles.field}>
            <label className={styles.label}>Verify via</label>
            <div className={styles.methodToggle}>
              {(["email", "sms"] as VerificationMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => props.onMethodChange?.(m)}
                  className={clsx(styles.methodBtn, props.values.method === m && styles.methodBtnActive)}
                >
                  {m === "email" ? "Email" : "SMS"}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {isSignup && props.values.method === "sms" ? (
          <div className={styles.field}>
            <label className={styles.label}>Phone number</label>
            <input
              type="tel"
              value={props.values.phone ?? ""}
              onChange={(e) => props.onPhoneChange?.(e.target.value)}
              onBlur={props.onPhoneBlur}
              className={styles.input}
              placeholder="+1 555 000 0000"
            />
            {props.errors?.phone ? <p className={styles.fieldError}>{props.errors.phone}</p> : null}
          </div>
        ) : null}
      </div>

      {props.errors?.form ? <p className={styles.formError}>{props.errors.form}</p> : null}

      <button
        type="submit"
        disabled={props.isSubmitting || !props.isFormValid}
        className={styles.submitBtn}
      >
        {props.isSubmitting ? "Please wait..." : isSignup ? "Continue" : "Sign in"}
      </button>
    </form>
  );
}
