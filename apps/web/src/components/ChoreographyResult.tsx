"use client";

import { useTranslations } from "next-intl";
import type { Choreography } from "../types/choreography";
import type { Plan } from "../constants/plans";
import styles from "./ChoreographyResult.module.css";

export type ChoreographyResultProps = {
  choreography: Choreography;
  plan?: Plan;
};

export function ChoreographyResult({ choreography, plan = "free" }: ChoreographyResultProps) {
  const t = useTranslations("result");
  const tp = useTranslations("plans");
  const isPro = plan === "pro" || plan === "max";
  const isMax = plan === "max";

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.name}>{choreography.name}</h2>
          {plan !== "free" && (
            <span className={isMax ? styles.badgeMax : styles.badgePro}>
              {isMax ? tp("max") : tp("pro")}
            </span>
          )}
        </div>
        <div className={styles.meta}>
          <span className={styles.badgeAccent}>{choreography.style}</span>
          <span className={styles.badge}>{choreography.duration} min</span>
          <span className={styles.badge}>{choreography.difficulty}</span>
          <span className={styles.badge}>{choreography.targetAudience}</span>
        </div>
      </div>

      {choreography.music ? (
        <div className={styles.music}>
          <p className={styles.musicLabel}>{t("suggestedMusic")}</p>
          <p className={styles.musicTitle}>{choreography.music.title}</p>
          <p className={styles.musicSub}>
            {choreography.music.artist} · {choreography.music.bpm} BPM
          </p>
        </div>
      ) : null}

      <div className={styles.movesSection}>
        <p className={styles.movesTitle}>{t("sequence")} — {choreography.moves.length} {t("moves")}</p>
        <div className={styles.moveList}>
          {choreography.moves.map((move) => (
            <div key={move.id} className={styles.move}>
              <span className={styles.moveOrder}>{move.order}</span>
              <div className={styles.moveBody}>
                <p className={styles.moveName}>{move.name}</p>
                <p className={styles.moveMeta}>{move.duration}s</p>
                <p className={styles.moveDesc}>{move.description}</p>
                {isMax && move.verbalCue && (
                  <p className={styles.verbalCue}>💬 {move.verbalCue}</p>
                )}
                {isPro && move.videoQuery && (
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(move.videoQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.videoLink}
                  >
                    {t("watchDemo")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isPro && (
        <div className={styles.upgradeNudge}>{t("upgradeTip")}</div>
      )}
    </div>
  );
}
