"use client";

import Link from "next/link";
import { useState } from "react";
import { DANCE_STYLES, DIFFICULTIES, DURATIONS, FITNESS_STYLES } from "../../../constants/choreography";
import { ROUTES } from "../../../constants/routes";
import { useChoreographyForm } from "../../../hooks/useChoreographyForm";
import { useChoreographyGenerator } from "../../../hooks/useChoreographyGenerator";
import { GeneratingOverlay } from "../../../components/GeneratingOverlay";
import type { Plan } from "../../../constants/plans";
import type { ChoreographyStyle, ChoreographyDifficulty } from "../../../types/choreography";
import styles from "./page.module.css";

const DIFF_META: Record<string, { desc: string; dots: number }> = {
  Beginner:     { desc: "Simple cues, low impact", dots: 1 },
  Intermediate: { desc: "Combines + light syncopation", dots: 2 },
  Advanced:     { desc: "Complex patterns, full range", dots: 3 },
};

function IconSpark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" />
    </svg>
  );
}

export function NewChoreographyClient({ plan }: { plan: Plan }) {
  const [category, setCategory] = useState<"Dance" | "Fitness">("Dance");
  const [bpm, setBpm] = useState(120);

  const generator = useChoreographyGenerator();
  const form = useChoreographyForm({ onValidSubmit: generator.generate });

  const styleList: readonly ChoreographyStyle[] =
    category === "Dance" ? DANCE_STYLES : FITNESS_STYLES;

  // Keep style in sync when category changes
  function handleCategoryChange(cat: "Dance" | "Fitness") {
    setCategory(cat);
    const list = cat === "Dance" ? DANCE_STYLES : FITNESS_STYLES;
    if (!(list as readonly string[]).includes(form.values.style)) {
      form.setStyle(list[0]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.isValid) return;
    generator.generate(form.values);
  }

  return (
    <main className={styles.main}>
      {generator.isGenerating && (
        <GeneratingOverlay plan={plan} style={form.values.style} bpm={bpm} />
      )}

      <Link href={ROUTES.DASHBOARD} className={styles.backLink}>
        ← Cancel
      </Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          Compose a <span className={styles.accentWord}>new set</span>
        </h1>
        <p className={styles.pageSub}>
          Sketch the shape. Offbeat writes the moves, picks the music, and aligns everything to the beat.
        </p>
      </div>

      {generator.error && (
        <div className={styles.errorBanner}>{generator.error}</div>
      )}

      <form className={styles.formCard} onSubmit={handleSubmit}>
        {/* ── 01 Discipline ── */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionLabel}>01 · Discipline</span>
            <span className={styles.sectionHint}>{styleList.length} styles available</span>
          </div>

          <div className={styles.styleTabs}>
            {(["Dance", "Fitness"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                className={category === cat ? styles.styleTabActive : styles.styleTab}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.styleGrid}>
            {styleList.map((s) => (
              <button
                key={s}
                type="button"
                className={form.values.style === s ? styles.styleOptSelected : styles.styleOpt}
                onClick={() => form.setStyle(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── 02 Duration & tempo ── */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionLabel}>02 · Duration & tempo</span>
            <span className={styles.sectionHint}>Slide to target length</span>
          </div>

          <div className={styles.durationRow}>
            <div className={styles.durationValue}>
              {form.values.duration}
              <span className={styles.durationUnit}>min</span>
            </div>
            <div className={styles.sliderWrap}>
              <input
                type="range"
                className={styles.rangeSlider}
                min={0}
                max={DURATIONS.length - 1}
                step={1}
                value={form.durationIndex}
                onChange={(e) => form.setDurationIndex(Number(e.target.value))}
              />
              <div className={styles.durationLabels}>
                {DURATIONS.map((d, i) => (
                  <span
                    key={d}
                    className={i === form.durationIndex ? styles.durationLabelActive : styles.durationLabel}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.bpmRow}>
            <div className={styles.bpmSliderWrap}>
              <label className={styles.fieldLabel}>Target BPM</label>
              <input
                type="range"
                className={styles.rangeSlider}
                min={60}
                max={180}
                step={1}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
              />
              <div className={styles.bpmHints}>
                <span>60 · slow</span>
                <span>120 · mid</span>
                <span>180 · hot</span>
              </div>
            </div>
            <div className={styles.bpmReadout}>
              <div className={styles.bpmValue}>{bpm}</div>
              <div className={styles.bpmUnit}>BPM</div>
            </div>
          </div>
        </div>

        {/* ── 03 Difficulty ── */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionLabel}>03 · Difficulty</span>
          </div>
          <div className={styles.diffSeg}>
            {DIFFICULTIES.map((d, i) => {
              const meta = DIFF_META[d] ?? { desc: "", dots: i + 1 };
              return (
                <button
                  key={d}
                  type="button"
                  className={form.values.difficulty === d ? styles.diffOptSelected : styles.diffOpt}
                  onClick={() => form.setDifficulty(d as ChoreographyDifficulty)}
                >
                  <div className={form.values.difficulty === d ? styles.diffLevelActive : styles.diffLevel}>{d}</div>
                  <div className={styles.diffDesc}>{meta.desc}</div>
                  <div className={styles.diffDots}>
                    {[0, 1, 2].map((n) => (
                      <div
                        key={n}
                        className={n < meta.dots ? styles.diffDotOn : styles.diffDot}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 04 Audience & notes ── */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionLabel}>04 · Audience & notes</span>
          </div>
          <label className={styles.fieldLabel}>Target audience</label>
          <input
            className={styles.textInput}
            value={form.values.targetAudience}
            onChange={(e) => form.setTargetAudience(e.target.value)}
            placeholder="e.g., Seniors, Beginners, HIIT lovers"
          />
          {form.errors.targetAudience && (
            <p className={styles.fieldError}>{form.errors.targetAudience}</p>
          )}
          <label className={styles.fieldLabel} style={{ marginTop: 18 }}>Instructor notes</label>
          <textarea
            className={styles.areaInput}
            rows={4}
            value={form.values.description}
            onChange={(e) => form.setDescription(e.target.value)}
            placeholder="Describe the vibe, goals, and any constraints…"
          />
        </div>

        {/* ── Footer ── */}
        <div className={styles.formFoot}>
          <div className={styles.footNote}>
            <IconSpark />
            Claude will draft 8–14 moves totalling ~{form.values.duration} min
          </div>
          <div className={styles.footActions}>
            <Link href={ROUTES.DASHBOARD} className={styles.cancelBtn}>Cancel</Link>
            <button type="submit" className={styles.generateBtn} disabled={!form.isValid || generator.isGenerating}>
              <IconSpark /> Generate choreography
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
