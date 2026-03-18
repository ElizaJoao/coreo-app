"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Choreography, UpdateChoreographyRequest } from "@coreo/shared";
import { deleteChoreography, updateChoreography } from "@/lib/api";
import { getToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function EditChoreographyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [choreo, setChoreo] = useState<Choreography | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const timelineText = useMemo(() => {
    if (!choreo) return "";
    return choreo.timeline
      .map((m) => `${m.name} | ${m.counts}${m.cue ? ` | ${m.cue}` : ""}`)
      .join("\n");
  }, [choreo]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const token = getToken();
        if (!token) {
          throw new Error("Not logged in");
        }
        const res = await fetch(`${API_BASE}/choreographies/${encodeURIComponent(id)}`, {
          cache: "no-store"
          ,
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const data = (await res.json()) as Choreography;
        if (!cancelled) setChoreo(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onSave() {
    if (!choreo) return;
    setIsSaving(true);
    setError(null);
    try {
      const patch: UpdateChoreographyRequest = {
        name: choreo.name,
        bpm: choreo.bpm,
        song: choreo.song,
        timeline: choreo.timeline
      };
      const updated = await updateChoreography(choreo.id, patch);
      setChoreo(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  }

  async function onDelete() {
    if (!choreo) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteChoreography(choreo.id);
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (error) {
    return (
      <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
        <p style={{ color: "crimson" }}>{error}</p>
        <Link href="/">Back</Link>
      </main>
    );
  }

  if (!choreo) {
    return (
      <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ marginTop: 0 }}>Edit choreography</h1>
          <div style={{ color: "#555" }}>
            {choreo.style} • {choreo.level} • {choreo.audience} • {choreo.durationMinutes} min
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/">Back</Link>
          <button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </button>
          <button onClick={onDelete} disabled={isDeleting} style={{ color: "crimson" }}>
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </header>

      <section
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>Name</span>
          <input
            value={choreo.name}
            onChange={(e) => setChoreo({ ...choreo, name: e.target.value })}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>BPM</span>
          <input
            type="number"
            min={60}
            max={220}
            value={choreo.bpm}
            onChange={(e) => setChoreo({ ...choreo, bpm: Number(e.target.value) })}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Song (optional)</span>
          <input
            placeholder="Title — Artist"
            value={
              choreo.song?.title
                ? `${choreo.song.title}${choreo.song.artist ? ` — ${choreo.song.artist}` : ""}`
                : ""
            }
            onChange={(e) => {
              const raw = e.target.value;
              const [title, artist] = raw.split("—").map((s) => s.trim());
              const song =
                title || artist ? { title: title || undefined, artist: artist || undefined } : undefined;
              setChoreo({ ...choreo, song });
            }}
          />
        </label>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ margin: "0 0 8px" }}>Timeline</h2>
        <p style={{ margin: "0 0 12px", color: "#555" }}>
          Edit as lines: <code>Move name | counts | cue</code>
        </p>
        <textarea
          value={timelineText}
          onChange={(e) => {
            const lines = e.target.value.split("\n").map((l) => l.trim());
            const timeline = lines
              .filter(Boolean)
              .map((line) => {
                const [name, counts, cue] = line.split("|").map((s) => s.trim());
                return { name: name || "Move", counts: counts || "4x8", cue: cue || "" };
              });
            setChoreo({ ...choreo, timeline });
          }}
          rows={12}
          style={{ width: "100%" }}
        />
      </section>
    </main>
  );
}

