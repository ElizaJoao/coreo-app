"use client";

import Link from "next/link";
import { useState } from "react";

import styles from "./page.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <Link href="/login" className={styles.backLink}>← Back to sign in</Link>
      <div className={styles.card}>
        {submitted ? (
          <>
            <h1 className={styles.title}>Check your email</h1>
            <p className={styles.subtitle}>
              If an account exists for <strong>{email}</strong>, we've sent a reset link. Check your inbox (and spam folder).
            </p>
            <Link href="/login" className={styles.btn}>Back to sign in</Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 className={styles.title}>Reset password</h1>
            <p className={styles.subtitle}>Enter your email and we'll send you a reset link.</p>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.btn} disabled={loading || !email}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
