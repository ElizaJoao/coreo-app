"use client";

import { useTranslations } from "next-intl";
import type { ChoreographyMove } from "../types/choreography";
import { StickFigureCanvas } from "./StickFigureCanvas";
import styles from "./MoveDemoModal.module.css";

export type MoveDemoModalProps = {
  move: ChoreographyMove;
  bpm?: number;
  onClose: () => void;
};

export function MoveDemoModal({ move, bpm, onClose }: MoveDemoModalProps) {
  const t = useTranslations("move");

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.moveName}>{move.name}</span>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t("close")}>✕</button>
        </div>
        <StickFigureCanvas moveName={move.name} bpm={bpm} className={styles.canvas} />
        <div className={styles.footer}>
          <span className={styles.durationBadge}>{move.duration}s</span>
          {move.description && <p className={styles.desc}>{move.description}</p>}
        </div>
      </div>
    </div>
  );
}
