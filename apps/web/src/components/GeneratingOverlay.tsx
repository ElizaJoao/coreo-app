"use client";

import { useEffect, useState } from "react";

import styles from "./GeneratingOverlay.module.css";

const STEPS = [
  "Analyzing your style…",
  "Designing the move sequence…",
  "Calculating timing and tempo…",
  "Selecting fitting music…",
  "Polishing the details…",
  "Almost there…",
];

const STEP_DURATION = 1800;

export function GeneratingOverlay() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const id = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, STEP_DURATION);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`${styles.overlay} ${visible ? styles.overlayVisible : ""}`}>
      <div className={styles.card}>
        <div className={styles.iconRing}>
          <span className={styles.iconDot} />
          <span className={styles.iconDot} />
          <span className={styles.iconDot} />
        </div>
        <p className={styles.heading}>Generating choreography</p>
        <p key={step} className={styles.step}>{STEPS[step]}</p>
        <div className={styles.bar}>
          <div className={styles.barFill} />
        </div>
      </div>
    </div>
  );
}
