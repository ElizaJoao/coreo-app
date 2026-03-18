"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GenerateChoreographyRequestSchema,
  type GenerateChoreographyRequest
} from "@coreo/shared";
import { generateChoreography } from "@/lib/api";

const styles = [
  "Hip Hop",
  "Salsa",
  "Tango",
  "Zumba",
  "Power Jump",
  "Pilates",
  "Body Pump",
  "Step",
  "HIIT",
  "Ballet (Kids)",
  "Yoga"
];

export default function NewChoreographyPage() {
  const router = useRouter();
  const [style, setStyle] = useState("Zumba");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [level, setLevel] = useState<GenerateChoreographyRequest["level"]>("intermediate");
  const [audience, setAudience] = useState<GenerateChoreographyRequest["audience"]>("adults");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo<GenerateChoreographyRequest>(
    () => ({ style, durationMinutes, level, audience, notes }),
    [style, durationMinutes, level, audience, notes]
  );

  async function onSubmit() {
    setError(null);
    const parsed = GenerateChoreographyRequestSchema.safeParse(payload);
    if (!parsed.success) {
      setError("Please check your inputs.");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await generateChoreography(parsed.data);
      router.push(`/c/${encodeURIComponent(created.id)}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to generate choreography. (Are you logged in?)"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>New choreography</h1>
      <p style={{ color: "#555" }}>
        This uses the API generator (stub “AI” for now). Next we can plug in a real model.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 16
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>Style</span>
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            {styles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Duration (minutes)</span>
          <input
            type="number"
            min={5}
            max={90}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Level</span>
          <select value={level} onChange={(e) => setLevel(e.target.value as any)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Audience</span>
          <select value={audience} onChange={(e) => setAudience(e.target.value as any)}>
            <option value="kids">Kids</option>
            <option value="adults">Adults</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
          <span>Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="e.g., focus on arms, simple transitions, chorus highlights…"
          />
        </label>
      </div>

      {error ? (
        <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>
      ) : (
        <div style={{ height: 24 }} />
      )}

      <button onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Generating…" : "Generate choreography"}
      </button>
    </main>
  );
}

