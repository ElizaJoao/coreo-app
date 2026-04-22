"use client";

import Link from "next/link";

import { AuthForm } from "../../components/AuthForm";
import { useAuthForm } from "../../hooks/useAuthForm";
import styles from "../login/page.module.css";

export default function SignupPage() {
  const form = useAuthForm("signup");

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.homeLink}>← Back to home</Link>
      <div className={styles.card}>
        <AuthForm
          mode="signup"
          values={form.values}
          errors={form.errors}
          isFormValid={form.isFormValid}
          isSubmitting={form.isSubmitting}
          onNameChange={form.setName}
          onNameBlur={form.touchName}
          onEmailChange={form.setEmail}
          onEmailBlur={form.touchEmail}
          onPasswordChange={form.setPassword}
          onPasswordBlur={form.touchPassword}
          onMethodChange={form.setMethod}
          onPhoneChange={form.setPhone}
          onPhoneBlur={form.touchPhone}
          onSubmit={form.handleSubmit}
        />
        <p className={styles.switchLink}>
          Already registered?{" "}
          <Link href="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}
