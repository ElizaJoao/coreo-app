"use client";

import { useWelcomeOnboarding } from "../hooks/useOnboarding";
import styles from "./WelcomeModal.module.css";

const FEATURES = [
  {
    icon: "✦",
    title: "Generate with AI",
    body: "Describe your class — style, duration, audience — and Offbeat builds the full routine with moves, formations, and music.",
  },
  {
    icon: "⬡",
    title: "Set positions",
    body: "In the editor, drag each dancer to their spot on the stage. Every move can have a different formation.",
  },
  {
    icon: "♪",
    title: "Add your music",
    body: "Search for songs and drop them on the timeline. Set exactly when each track plays in your routine.",
  },
] as const;

export function WelcomeModal() {
  const { show, dismiss } = useWelcomeOnboarding();

  if (!show) return null;

  return (
    <div className={styles.backdrop} onClick={dismiss}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.badge}>NEW</div>
        <h2 className={styles.heading}>Welcome to Offbeat</h2>
        <p className={styles.sub}>
          Your AI-powered choreography studio. Here&rsquo;s what you can do in minutes.
        </p>

        <div className={styles.features}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureBody}>{f.body}</div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.cta} onClick={dismiss}>
            Let&apos;s go →
          </button>
          <p className={styles.hint}>
            A short guide will appear the first time you open the editor.
          </p>
        </div>
      </div>
    </div>
  );
}
