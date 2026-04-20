"use client";

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

export function AuthForm(props: AuthFormProps) {
  const isSignup = props.mode === "signup";

  return (
    <form onSubmit={props.onSubmit} className={styles.form}>
      <h1 className={styles.title}>{isSignup ? "Create account" : "Sign in"}</h1>
      <p className={styles.subtitle}>
        {isSignup ? "Start building choreographies." : "Welcome back to Coreo."}
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
          <label className={styles.label}>Password</label>
          <input
            type="password"
            value={props.values.password}
            onChange={(e) => props.onPasswordChange(e.target.value)}
            onBlur={props.onPasswordBlur}
            className={styles.input}
            placeholder="********"
          />
          <p className={styles.hint}>Must be 8+ chars with uppercase, lowercase, number, and symbol.</p>
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
        {props.isSubmitting
          ? "Please wait..."
          : isSignup
            ? "Continue"
            : "Sign in"}
      </button>
    </form>
  );
}
