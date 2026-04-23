"use client";

import { useTranslations } from "next-intl";
import type { ChoreographyMove } from "../types/choreography";
import styles from "./MoveRow.module.css";

export type MoveRowProps = {
  move: ChoreographyMove;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<ChoreographyMove>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  plan?: "free" | "pro" | "max";
};

export function MoveRow(props: MoveRowProps) {
  const { move, plan = "free" } = props;
  const t = useTranslations("move");
  const isPro = plan === "pro" || plan === "max";
  const isMax = plan === "max";

  const rowClass = [
    styles.row,
    isMax ? styles.rowMax : isPro ? styles.rowPro : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={rowClass}>
      <div className={styles.orderCol}>
        <span className={styles.orderNum}>{move.order}</span>
        <div className={styles.arrows}>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={props.onMoveUp}
            disabled={props.isFirst}
            aria-label={t("moveUp")}
          >▲</button>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={props.onMoveDown}
            disabled={props.isLast}
            aria-label={t("moveDown")}
          >▼</button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.topLine}>
          <input
            className={styles.nameInput}
            value={move.name}
            onChange={(e) => props.onUpdate({ name: e.target.value })}
            placeholder={t("namePlaceholder")}
          />
          <div className={styles.durationField}>
            <input
              type="number"
              className={styles.durationInput}
              value={move.duration}
              min={5}
              max={600}
              onChange={(e) => props.onUpdate({ duration: Number(e.target.value) })}
            />
            <span className={styles.durationUnit}>{t("seconds")}</span>
          </div>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={props.onDelete}
            aria-label={t("deleteMove")}
          >✕</button>
        </div>
        <textarea
          className={styles.descInput}
          value={move.description}
          rows={2}
          placeholder={t("cuePlaceholder")}
          onChange={(e) => props.onUpdate({ description: e.target.value })}
        />

        {isMax && move.verbalCue && (
          <div className={styles.verbalCue}>
            <span className={styles.verbalCueLabel}>{t("say")}</span>
            <span className={styles.verbalCueText}>{move.verbalCue}</span>
          </div>
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
  );
}
