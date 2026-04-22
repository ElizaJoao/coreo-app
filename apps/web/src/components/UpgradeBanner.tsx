"use client";

import { useState } from "react";
import styles from "./UpgradeBanner.module.css";

export type UpgradeBannerProps = {
  plan: string;
};

export function UpgradeBanner({ plan }: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const label = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className={styles.banner}>
      <span className={styles.icon}>🎉</span>
      <span className={styles.text}>
        Payment successful — your <strong>{label}</strong> plan is now active!
      </span>
      <button
        type="button"
        className={styles.close}
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
