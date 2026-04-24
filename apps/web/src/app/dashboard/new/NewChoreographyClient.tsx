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

// ── Wizard types ───────────────────────────────────────────────────────────

type WizardStep = 0 | 1 | 2 | 3; // Vibe | Music | Dancers | Review

type WizardDancer = { id: string; name: string; color: string };

type Formation = "line" | "v-shape" | "diamond" | "circle" | "free";

const WIZARD_STEPS = ["Vibe", "Music", "Dancers", "Review"] as const;

const DEFAULT_DANCERS: WizardDancer[] = [
  { id: "d1", name: "Ana",   color: "#e85d5d" },
  { id: "d2", name: "Bruno", color: "#5d9be8" },
  { id: "d3", name: "Clara", color: "#5de87a" },
  { id: "d4", name: "Diego", color: "#e8c45d" },
  { id: "d5", name: "Elena", color: "#c45de8" },
  { id: "d6", name: "Faris", color: "#5de8d4" },
];

const DANCER_COLORS = ["#e85d5d","#5d9be8","#5de87a","#e8c45d","#c45de8","#5de8d4","#e8875d","#9b5de8"];
const DANCER_NAMES  = ["Alex","Sam","Jordan","Morgan","Taylor","Casey","Riley","Drew"];

const DIFF_META: Record<string, { desc: string; dots: number }> = {
  Beginner:     { desc: "Simple cues, low impact", dots: 1 },
  Intermediate: { desc: "Combines + light syncopation", dots: 2 },
  Advanced:     { desc: "Complex patterns, full range", dots: 3 },
};

// Formation positions for the mini stage (x/y as fraction of 200×160)
const FORMATION_POSITIONS: Record<Formation, [number, number][]> = {
  line:     [[0.15,0.5],[0.32,0.5],[0.5,0.5],[0.68,0.5],[0.85,0.5]],
  "v-shape":[[0.5,0.25],[0.3,0.55],[0.7,0.55],[0.15,0.8],[0.85,0.8]],
  diamond:  [[0.5,0.15],[0.2,0.5],[0.8,0.5],[0.5,0.85]],
  circle:   [[0.5,0.15],[0.82,0.35],[0.82,0.7],[0.5,0.88],[0.18,0.7],[0.18,0.35]],
  free:     [[0.25,0.3],[0.6,0.25],[0.8,0.5],[0.4,0.65],[0.15,0.7],[0.65,0.8]],
};

// ── Mini stage (overhead blobs) ─────────────────────────────────────────────

function MiniStage({ dancers, formation }: { dancers: WizardDancer[]; formation: Formation }) {
  const positions = FORMATION_POSITIONS[formation];
  const W = 200, H = 160;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.miniStage}>
      <rect width={W} height={H} fill="#0d0d0d" rx="8" />
      <ellipse cx={W / 2} cy={H / 2} rx={W * 0.44} ry={H * 0.42} fill="#181818" stroke="#252525" strokeWidth="1" />
      {dancers.map((d, i) => {
        const [xf, yf] = positions[i % positions.length];
        return (
          <g key={d.id} transform={`translate(${W * xf}, ${H * yf})`}>
            <defs>
              <radialGradient id={`ms-${d.id}`} cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor={d.color} stopOpacity="1" />
                <stop offset="100%" stopColor={d.color} stopOpacity="0.5" />
              </radialGradient>
            </defs>
            <ellipse cx="0" cy="0" rx="11" ry="14" fill={`url(#ms-${d.id})`} />
            <text x="0" y="4" textAnchor="middle" fontSize="7" fontWeight="700" fill="white" opacity="0.9" fontFamily="sans-serif">
              {d.name[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconSpark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M8 2v12M2 8h12" />
    </svg>
  );
}

// ── Left panel: AI-first brief ───────────────────────────────────────────────

function AiBriefPanel({ plan }: { plan: Plan }) {
  const [category, setCategory] = useState<"Dance" | "Fitness">("Dance");
  const [bpm, setBpm] = useState(118);
  const [dancerCount, setDancerCount] = useState(6);
  const [brief, setBrief] = useState("");

  const generator = useChoreographyGenerator();
  const form = useChoreographyForm({ onValidSubmit: generator.generate });

  const styleList: readonly ChoreographyStyle[] =
    category === "Dance" ? DANCE_STYLES : FITNESS_STYLES;

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
    <div className={styles.leftPanel}>
      {generator.isGenerating && (
        <GeneratingOverlay plan={plan} style={form.values.style} bpm={bpm} />
      )}

      <Link href={ROUTES.DASHBOARD} className={styles.backLink}>← Back</Link>

      <div className={styles.leftHeader}>
        <h1 className={styles.pageTitle}>
          Compose a <span className={styles.accentWord}>new set</span>
        </h1>
        <p className={styles.pageSub}>
          Describe the vibe. Claude crafts the sequence. You refine.
        </p>
      </div>

      {generator.error && (
        <div className={styles.errorBanner}>{generator.error}</div>
      )}

      {/* Brief card */}
      <div className={styles.briefCard}>
        <div className={styles.briefLabel}>
          <IconSpark /> THE BRIEF
        </div>
        <textarea
          className={styles.briefArea}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="A 30-minute hip hop warm-up for teens, energetic, should peak at minute 20."
          rows={4}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Discipline */}
        <div className={styles.miniSection}>
          <span className={styles.miniLabel}>DISCIPLINE</span>
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

        {/* Difficulty */}
        <div className={styles.miniSection}>
          <span className={styles.miniLabel}>DIFFICULTY</span>
          <div className={styles.diffRow}>
            {DIFFICULTIES.map((d, i) => (
              <button
                key={d}
                type="button"
                className={form.values.difficulty === d ? styles.diffBtnActive : styles.diffBtn}
                onClick={() => form.setDifficulty(d as ChoreographyDifficulty)}
              >
                {d}
                <span className={styles.diffBtnDots}>
                  {[0, 1, 2].map((n) => (
                    <span key={n} className={n <= i ? styles.dotOn : styles.dot} />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration + Dancers */}
        <div className={styles.miniSectionRow}>
          <div className={styles.miniSection}>
            <span className={styles.miniLabel}>DURATION</span>
            <div className={styles.durationRow}>
              <span className={styles.durationVal}>
                {form.values.duration}
                <span className={styles.durationUnit}>min</span>
              </span>
              <div className={styles.sliderCol}>
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
                    <span key={d} className={i === form.durationIndex ? styles.durLabelActive : styles.durLabel}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.miniSection}>
            <span className={styles.miniLabel}>DANCERS / STUDENTS</span>
            <div className={styles.dancersRow}>
              <span className={styles.dancersVal}>
                {dancerCount}
                <span className={styles.dancersUnit}>on stage</span>
              </span>
              <input
                type="range"
                className={styles.rangeSlider}
                min={1}
                max={12}
                step={1}
                value={dancerCount}
                onChange={(e) => setDancerCount(Number(e.target.value))}
              />
              <div className={styles.dancerDots}>
                {Array.from({ length: Math.min(dancerCount, 8) }, (_, i) => (
                  <span
                    key={i}
                    className={styles.dancerDot}
                    style={{ background: DANCER_COLORS[i % DANCER_COLORS.length] }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.formFoot}>
          <div className={styles.footNote}>
            <IconSpark />
            Claude will draft 8–14 moves + formation per move.
          </div>
          <div className={styles.footActions}>
            <Link href={ROUTES.DASHBOARD} className={styles.cancelBtn}>Cancel</Link>
            <button
              type="submit"
              className={styles.generateBtn}
              disabled={!form.isValid || generator.isGenerating}
            >
              <IconSpark /> Generate
            </button>
          </div>
        </div>
      </form>

      {/* Secondary options */}
      <div className={styles.altCards}>
        <div className={styles.altCard}>
          <div className={styles.altCardTitle}>Start from blank</div>
          <div className={styles.altCardDesc}>Build move by move on the timeline.</div>
        </div>
        <div className={styles.altCard}>
          <div className={styles.altCardTitle}>Remix a template</div>
          <div className={styles.altCardDesc}>Pick a blueprint — reggaeton warm-up, K-pop combo…</div>
        </div>
      </div>
    </div>
  );
}

// ── Right panel: Guided wizard ───────────────────────────────────────────────

function GuidedWizardPanel() {
  const [step, setStep] = useState<WizardStep>(2); // start on Dancers step for demo
  const [dancers, setDancers] = useState<WizardDancer[]>(DEFAULT_DANCERS);
  const [formation, setFormation] = useState<Formation>("circle");

  function addDancer() {
    if (dancers.length >= 12) return;
    const i = dancers.length % DANCER_NAMES.length;
    setDancers([
      ...dancers,
      { id: `d-${Date.now()}`, name: DANCER_NAMES[i], color: DANCER_COLORS[i % DANCER_COLORS.length] },
    ]);
  }

  function removeDancer(id: string) {
    setDancers(dancers.filter((d) => d.id !== id));
  }

  return (
    <div className={styles.rightPanel}>
      <Link href={ROUTES.DASHBOARD} className={styles.backLink}>← Back</Link>

      {/* Step tabs */}
      <div className={styles.wizardSteps}>
        {WIZARD_STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <button
              key={label}
              type="button"
              className={`${styles.wizardStep} ${done ? styles.wizardStepDone : ""} ${active ? styles.wizardStepActive : ""}`}
              onClick={() => setStep(i as WizardStep)}
            >
              <span className={styles.wizardStepNum}>
                {done ? "✓" : String(i + 1).padStart(2, "0")}
              </span>
              <span className={styles.wizardStepLabel}>{label}</span>
              {i < WIZARD_STEPS.length - 1 && <span className={styles.wizardStepLine} />}
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div className={styles.wizardContent}>
        {step === 2 && (
          <>
            <div className={styles.wizardStepCrumb}>STEP 03 · DANCERS</div>
            <h2 className={styles.wizardTitle}>Who's on stage?</h2>
            <p className={styles.wizardDesc}>
              Name your dancers. Claude will assign positions per move — you can edit later.
            </p>

            <div className={styles.wizardCols}>
              {/* Dancer roster */}
              <div className={styles.rosterCard}>
                <div className={styles.rosterHead}>
                  <span className={styles.rosterLabel}>ROSTER · {dancers.length}</span>
                </div>
                <div className={styles.rosterList}>
                  {dancers.map((d, i) => (
                    <div key={d.id} className={styles.rosterRow}>
                      <span className={styles.rosterAvatar} style={{ background: d.color }}>
                        {d.name[0]}
                      </span>
                      <span className={styles.rosterName}>{d.name}</span>
                      <div className={styles.rosterRowActions}>
                        <span className={styles.rosterTag}>eq {i}</span>
                        <span className={styles.rosterTag}>f{i + 1}</span>
                        <button
                          type="button"
                          className={styles.rosterRemove}
                          onClick={() => removeDancer(d.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className={styles.addDancerBtn} onClick={addDancer}>
                  <IconPlus /> Add dancer
                </button>
              </div>

              {/* Formation preview */}
              <div className={styles.formationCard}>
                <div className={styles.rosterHead}>
                  <span className={styles.rosterLabel}>STARTING FORMATION</span>
                </div>
                <div className={styles.formationCrumb}>STAGE · INTRO</div>
                <MiniStage dancers={dancers} formation={formation} />
                <div className={styles.formationPresets}>
                  {(["line", "v-shape", "diamond", "circle", "free"] as Formation[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={formation === f ? styles.presetBtnActive : styles.presetBtn}
                      onClick={() => setFormation(f)}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1).replace("-", "-")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 0 && (
          <>
            <div className={styles.wizardStepCrumb}>STEP 01 · VIBE</div>
            <h2 className={styles.wizardTitle}>Set the vibe</h2>
            <p className={styles.wizardDesc}>Choose style, difficulty, and duration to match your class.</p>
          </>
        )}

        {step === 1 && (
          <>
            <div className={styles.wizardStepCrumb}>STEP 02 · MUSIC</div>
            <h2 className={styles.wizardTitle}>Pick a sound</h2>
            <p className={styles.wizardDesc}>Set the BPM and genre. Claude will suggest matching tracks.</p>
          </>
        )}

        {step === 3 && (
          <>
            <div className={styles.wizardStepCrumb}>STEP 04 · REVIEW</div>
            <h2 className={styles.wizardTitle}>Ready to generate</h2>
            <p className={styles.wizardDesc}>Review your setup, then let Claude compose the full sequence.</p>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className={styles.wizardNav}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => setStep((s) => Math.max(0, s - 1) as WizardStep)}
          disabled={step === 0}
        >
          ← Back
        </button>
        <button
          type="button"
          className={styles.continueBtn}
          onClick={() => setStep((s) => Math.min(3, s + 1) as WizardStep)}
        >
          {step === 3 ? "Generate →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}

// ── Page root ────────────────────────────────────────────────────────────────

export function NewChoreographyClient({ plan }: { plan: Plan }) {
  return (
    <div className={styles.twoCol}>
      <div className={styles.colLeft}>
        <div className={styles.colHeader}>
          <span className={styles.colNum}>01</span>
          <span className={styles.colName}>AI-first brief</span>
        </div>
        <AiBriefPanel plan={plan} />
      </div>

      <div className={styles.colDivider} />

      <div className={styles.colRight}>
        <div className={styles.colHeader}>
          <span className={styles.colNum}>02</span>
          <span className={styles.colName}>Guided wizard</span>
        </div>
        <GuidedWizardPanel />
      </div>
    </div>
  );
}
