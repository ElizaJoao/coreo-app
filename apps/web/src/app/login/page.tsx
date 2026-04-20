"use client";

import Link from "next/link";

import { AuthForm } from "../../components/AuthForm";
import { useAuthForm } from "../../hooks/useAuthForm";

export default function LoginPage() {
  const form = useAuthForm("login");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <AuthForm
          mode="login"
          values={{
            email: form.values.email,
            password: form.values.password,
          }}
          errors={form.errors}
          isFormValid={form.isFormValid}
          isSubmitting={form.isSubmitting}
          onEmailChange={form.setEmail}
          onEmailBlur={form.touchEmail}
          onPasswordChange={form.setPassword}
          onPasswordBlur={form.touchPassword}
          onSubmit={form.handleSubmit}
        />

        <p className="mt-4 text-center text-sm text-zinc-300">
          No account yet?{" "}
          <Link href="/signup" className="text-[#F5C842] underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

