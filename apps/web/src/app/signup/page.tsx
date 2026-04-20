"use client";

import Link from "next/link";

import { AuthForm } from "../../components/AuthForm";
import { useAuthForm } from "../../hooks/useAuthForm";

export default function SignupPage() {
  const form = useAuthForm("signup");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
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

        <p className="mt-4 text-center text-sm text-zinc-300">
          Already registered?{" "}
          <Link href="/login" className="text-[#F5C842] underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

