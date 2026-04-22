"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import styles from "../forgot-password/page.module.css";
import pwStyles from "./page.module.css";

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

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <>
        <h1 className={styles.title}>Invalid link</h1>
        <p className={styles.subtitle}>This password reset link is missing or invalid.</p>
        <Link href="/forgot-password" className={styles.btn}>Request a new link</Link>
      </>
    );
  }

  if (done) {
    return (
      <>
        <h1 className={styles.title}>Password updated!</h1>
        <p className={styles.subtitle}>Your password has been reset. You can now sign in.</p>
        <Link href="/login" className={styles.btn}>Sign in</Link>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className={styles.title}>New password</h1>
      <p className={styles.subtitle}>Choose a strong password for your account.</p>
      <div className={styles.field} style={{ marginTop: 8 }}>
        <label className={styles.label}>Password</label>
        <div className={pwStyles.passwordWrap}>
          <input
            type={showPassword ? "text" : "password"}
            className={styles.input}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className={pwStyles.eyeBtn}
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
      </div>
      {error && <p className={styles.error} style={{ marginTop: 8 }}>{error}</p>}
      <button type="submit" className={styles.btn} disabled={loading || !password} style={{ marginTop: 16 }}>
        {loading ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className={styles.page}>
      <Link href="/login" className={styles.backLink}>← Back to sign in</Link>
      <div className={styles.card}>
        <Suspense>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
