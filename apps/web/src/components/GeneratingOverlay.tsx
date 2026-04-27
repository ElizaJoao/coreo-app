"use client";

import { useEffect, useState } from "react";
import styles from "./GeneratingOverlay.module.css";

const GEN_STEPS = [
  "Reading your brief",
  "Mapping moves to your style",
  "Calibrating tempo and flow",
  "Finalising the sequence",
] as const;

const STEP_TIMERS_MS = [4000, 11000, 20000] as const;

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 9 6 13 14 3" />
    </svg>
  );
}

export type GeneratingOverlayProps = {
  plan?: "free" | "pro" | "max";
  style?: string;
  bpm?: number;
};

export function GeneratingOverlay({ plan = "free", style, bpm }: GeneratingOverlayProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEP_TIMERS_MS.map((ms, i) =>
      setTimeout(() => setStep(i + 1), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const title = style ? `Composing your ${style} set` : "Composing your set";
  const sub = bpm
    ? `Building at ${bpm} BPM · drawing from 10k patterns`
    : "Drawing from 10k patterns";

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.waveform}>
          {Array.from({ length: 22 }, (_, i) => (
            <div
              key={i}
              className={styles.bar}
              style={{ animationDelay: `${i * 40}ms` }}
            />
          ))}
        </div>

        <p className={styles.title}>{title}</p>
        <p className={styles.sub}>{sub}</p>

        <div className={styles.steps}>
          {GEN_STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={i}
                className={`${styles.step} ${done ? styles.stepDone : ""} ${active ? styles.stepActive : ""}`}
              >
                <div className={styles.stepIcon}>
                  {done ? (
                    <IconCheck />
                  ) : active ? (
                    <span className={styles.activeDot} />
                  ) : (
                    <span className={styles.idleDot} />
                  )}
                </div>
                <span>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
