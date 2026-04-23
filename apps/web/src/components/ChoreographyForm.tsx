"use client";

import { useTranslations } from "next-intl";
import type {
  ChoreographyDifficulty,
  ChoreographyDurationMinutes,
  ChoreographyStyle,
} from "../types/choreography";
import styles from "./ChoreographyForm.module.css";

export type ChoreographyFormProps = {
  style: ChoreographyStyle;
  onStyleChange: (style: ChoreographyStyle) => void;
  danceStyles: readonly ChoreographyStyle[];
  fitnessStyles: readonly ChoreographyStyle[];
  styleError?: string;

  duration: ChoreographyDurationMinutes;
  durationIndex: number;
  durationIndexMin: number;
  durationIndexMax: number;
  onDurationIndexChange: (index: number) => void;
  durationError?: string;

  targetAudience: string;
  onTargetAudienceChange: (value: string) => void;
  targetAudienceError?: string;

  difficulty: ChoreographyDifficulty;
  onDifficultyChange: (difficulty: ChoreographyDifficulty) => void;
  difficulties: readonly ChoreographyDifficulty[];
  difficultyError?: string;

  description: string;
  onDescriptionChange: (value: string) => void;
  descriptionError?: string;

  isValid: boolean;
  isSubmitting?: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function ChoreographyForm(props: ChoreographyFormProps) {
  const t = useTranslations("form");

  return (
    <form onSubmit={props.onSubmit} className={styles.form}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>{t("title")}</h2>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>
        <div className={styles.badge}>Offbeat</div>
      </div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label}>{t("style")}</label>
          <select
            value={props.style}
            onChange={(e) => props.onStyleChange(e.target.value as ChoreographyStyle)}
            className={styles.select}
          >
            <optgroup label={t("danceGroup")}>
              {props.danceStyles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </optgroup>
            <optgroup label={t("fitnessGroup")}>
              {props.fitnessStyles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </optgroup>
          </select>
          {props.styleError ? <p className={styles.fieldError}>{props.styleError}</p> : null}
        </div>

        <div className={styles.field}>
          <div className={styles.durationRow}>
            <label className={styles.label}>{t("duration")}</label>
            <span className={styles.durationValue}>{props.duration} {t("durationUnit")}</span>
          </div>
          <input
            type="range"
            min={props.durationIndexMin}
            max={props.durationIndexMax}
            step={1}
            value={props.durationIndex}
            onChange={(e) => props.onDurationIndexChange(Number(e.target.value))}
            className={styles.rangeInput}
          />
          {props.durationError ? (
            <p className={styles.fieldError}>{props.durationError}</p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t("audience")}</label>
          <input
            value={props.targetAudience}
            onChange={(e) => props.onTargetAudienceChange(e.target.value)}
            placeholder={t("audiencePlaceholder")}
            className={styles.input}
          />
          {props.targetAudienceError ? (
            <p className={styles.fieldError}>{props.targetAudienceError}</p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t("difficulty")}</label>
          <select
            value={props.difficulty}
            onChange={(e) => props.onDifficultyChange(e.target.value as ChoreographyDifficulty)}
            className={styles.select}
          >
            {props.difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {props.difficultyError ? (
            <p className={styles.fieldError}>{props.difficultyError}</p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t("description")}</label>
          <textarea
            value={props.description}
            onChange={(e) => props.onDescriptionChange(e.target.value)}
            rows={8}
            placeholder={t("descriptionPlaceholder")}
            className={styles.textarea}
          />
          {props.descriptionError ? (
            <p className={styles.fieldError}>{props.descriptionError}</p>
          ) : null}
        </div>
      </div>

      <div className={styles.footer}>
        <button
          type="submit"
          disabled={!props.isValid || props.isSubmitting}
          className={styles.submitBtn}
        >
          {props.isSubmitting ? t("generating") : t("generate")}
        </button>
      </div>
    </form>
  );
}
