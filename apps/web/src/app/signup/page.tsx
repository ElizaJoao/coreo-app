"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await register({ email, password });
      setToken(res.token);
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Create account</h1>
      <p style={{ color: "#555" }}>
        Already have an account? <Link href="/login">Log in</Link>.
      </p>

      <label style={{ display: "grid", gap: 6, marginTop: 12 }}>
        <span>Email</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label style={{ display: "grid", gap: 6, marginTop: 12 }}>
        <span>Password (min 8 chars)</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : <div style={{ height: 24 }} />}

      <button onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create account"}
      </button>
    </main>
  );
}

