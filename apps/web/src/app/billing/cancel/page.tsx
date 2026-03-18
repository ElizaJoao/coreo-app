"use client";

import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Checkout cancelled</h1>
      <p style={{ color: "#555" }}>No worries—you can try again anytime.</p>
      <Link href="/billing">Back to billing</Link>
    </main>
  );
}

