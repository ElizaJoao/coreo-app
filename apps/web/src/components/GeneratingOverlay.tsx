"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./GeneratingOverlay.module.css";

const STEP_DURATION = 1800;

export type GeneratingOverlayProps = {
  plan?: "free" | "pro" | "max";
};

export function GeneratingOverlay({ plan = "free" }: GeneratingOverlayProps) {
  const t = useTranslations("generate");
  const tp = useTranslations("plans");
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  const stepsFree = [t("analysing"), t("writingFree"), t("calculatingTiming"), t("finalising")];
  const stepsPro = [t("analysing"), t("designingPro"), t("findingVideos"), t("calculatingTiming"), t("polishing")];
  const stepsMax = [t("analysing"), t("designingPro"), t("writingCues"), t("findingVideos"), t("optimising"), t("finalising")];

  const steps = plan === "max" ? stepsMax : plan === "pro" ? stepsPro : stepsFree;

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
          <p className={styles.heading}>{t("title")}</p>
          {plan !== "free" && (
            <span className={plan === "max" ? styles.badgeMax : styles.badgePro}>
              {plan === "max" ? tp("max") : tp("pro")}
            </span>
          )}
        </div>

        <p key={step} className={styles.step}>{steps[step]}</p>

        <div className={styles.bar}>
          <div className={styles.barFill} />
        </div>

        {plan === "free" && (
          <p className={styles.upgradeTip}>{t("upgradeTip")}</p>
        )}
      </div>
    </div>
  );
}
