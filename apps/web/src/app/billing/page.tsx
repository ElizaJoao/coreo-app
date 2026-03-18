"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@coreo/shared";
import { createCheckoutSession, getMe } from "@/lib/api";

export default function BillingPage() {
  const [me, setMe] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const user = await getMe();
        if (!cancelled) setMe(user);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load user.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function start(plan: "basic" | "pro") {
    setError(null);
    setIsStartingCheckout(true);
    try {
      const { url } = await createCheckoutSession(plan);
      if (!url) throw new Error("Stripe did not return a checkout URL");
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start checkout.");
    } finally {
      setIsStartingCheckout(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ marginTop: 0 }}>Billing</h1>
        <Link href="/">Back</Link>
      </header>

      {isLoading ? (
        <p>Loading…</p>
      ) : !me ? (
        <p style={{ color: "#555" }}>
          Please <Link href="/login">log in</Link> to manage billing.
        </p>
      ) : (
        <>
          <p style={{ color: "#555" }}>
            Signed in as <b>{me.email}</b>
          </p>
          <p style={{ color: "#555" }}>
            Current subscription: <b>{me.subscription?.status ?? "none"}</b>
            {me.subscription?.plan ? ` (${me.subscription.plan})` : ""}
          </p>

          {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <button onClick={() => start("basic")} disabled={isStartingCheckout}>
              Subscribe — Basic
            </button>
            <button onClick={() => start("pro")} disabled={isStartingCheckout}>
              Subscribe — Pro
            </button>
          </div>
        </>
      )}
    </main>
  );
}

