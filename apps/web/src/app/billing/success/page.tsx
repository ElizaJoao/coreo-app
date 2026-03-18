"use client";

import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Payment successful</h1>
      <p style={{ color: "#555" }}>
        Thanks! If your subscription status doesn’t update immediately, refresh in a few seconds
        (webhooks can be delayed in dev).
      </p>
      <Link href="/billing">Back to billing</Link>
    </main>
  );
}

