"use client";

import { useEffect, useState } from "react";
import styles from "./GeneratingOverlay.module.css";

const STEPS_FREE = [
  "Analysing your parameters…",
  "Writing move sequence…",
  "Calculating timing and tempo…",
  "Finalising choreography…",
];

const STEPS_PRO = [
  "Analysing your parameters…",
  "Designing the move sequence…",
  "Finding demo videos for each move…",
  "Calculating timing and tempo…",
  "Polishing the details…",
];

const STEPS_MAX = [
  "Analysing your parameters…",
  "Designing the move sequence…",
  "Writing verbal cues for each move…",
  "Finding demo videos for each move…",
  "Optimising for instructor delivery…",
  "Finalising choreography…",
];

const STEP_DURATION = 1800;

export type GeneratingOverlayProps = {
  plan?: "free" | "pro" | "max";
};

export function GeneratingOverlay({ plan = "free" }: GeneratingOverlayProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  const steps = plan === "max" ? STEPS_MAX : plan === "pro" ? STEPS_PRO : STEPS_FREE;

  useEffect(() => {
    setVisible(true);
    const id = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, STEP_DURATION);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div className={`${styles.overlay} ${visible ? styles.overlayVisible : ""}`}>
      <div className={styles.card}>
        <div className={styles.iconRing}>
          <span className={styles.iconDot} />
          <span className={styles.iconDot} />
          <span className={styles.iconDot} />
        </div>

        <div className={styles.headingRow}>
          <p className={styles.heading}>Generating choreography</p>
          {plan !== "free" && (
            <span className={plan === "max" ? styles.badgeMax : styles.badgePro}>
              {plan === "max" ? "Max" : "Pro"}
            </span>
          )}
        </div>

        <p key={step} className={styles.step}>{steps[step]}</p>

        <div className={styles.bar}>
          <div className={styles.barFill} />
        </div>

        {plan === "free" && (
          <p className={styles.upgradeTip}>
            Upgrade to Pro for demo videos with every move
          </p>
        )}
      </div>
    </div>
  );
}
