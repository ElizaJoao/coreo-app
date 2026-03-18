"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Choreography, User } from "@coreo/shared";
import { clearToken, getToken } from "@/lib/auth";
import { getMe, listChoreographies } from "@/lib/api";

export default function Home() {
  const [items, setItems] = useState<Choreography[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) {
          if (!cancelled) setMe(null);
          return;
        }
        const user = await getMe();
        const list = await listChoreographies();
        if (!cancelled) {
          setMe(user);
          setItems(list);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Coreo</h1>
          <p style={{ margin: "8px 0 0", color: "#444" }}>
            Generate, edit, and reuse choreographies.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {me ? (
            <>
              <span style={{ color: "#555" }}>{me.email}</span>
              <Link href="/billing">Billing</Link>
              <button
                onClick={() => {
                  clearToken();
                  window.location.href = "/login";
                }}
              >
                Log out
              </button>
              <Link href="/new">+ New</Link>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup">Create account</Link>
            </>
          )}
        </div>
      </header>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ margin: "0 0 12px" }}>Your choreographies</h2>
        {!me ? (
          <p style={{ color: "#555" }}>
            Please <Link href="/login">log in</Link> to see your choreographies.
          </p>
        ) : isLoading ? (
          <p>Loading…</p>
        ) : error ? (
          <p style={{ color: "crimson" }}>{error}</p>
        ) : items.length === 0 ? (
          <p style={{ color: "#555" }}>
            No choreographies yet. Create your first one.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((c) => (
              <li
                key={c.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                    <div style={{ color: "#555", marginTop: 6 }}>
                      {c.style} • {c.level} • {c.audience} • {c.durationMinutes} min • {c.bpm}{" "}
                      BPM
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Link href={`/c/${encodeURIComponent(c.id)}`}>Edit</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

