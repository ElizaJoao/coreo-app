"use client";

import Link from "next/link";

import { AuthForm } from "../../components/AuthForm";
import { useAuthForm } from "../../hooks/useAuthForm";
import styles from "./page.module.css";

export default function LoginPage() {
  const form = useAuthForm("login");

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.homeLink}>← Back to home</Link>
      <div className={styles.card}>
        <AuthForm
          mode="login"
          values={{ email: form.values.email, password: form.values.password }}
          errors={form.errors}
          isFormValid={form.isFormValid}
          isSubmitting={form.isSubmitting}
          onEmailChange={form.setEmail}
          onEmailBlur={form.touchEmail}
          onPasswordChange={form.setPassword}
          onPasswordBlur={form.touchPassword}
          onSubmit={form.handleSubmit}
        />
        <p className={styles.switchLink}>
          No account yet?{" "}
          <Link href="/signup" className={styles.link}>Create one</Link>
        </p>
      </div>
    </main>
  );
}
