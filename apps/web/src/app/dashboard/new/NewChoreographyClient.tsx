"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { DANCE_STYLES, DIFFICULTIES, DURATIONS, FITNESS_STYLES } from "../../../constants/choreography";
import { ROUTES } from "../../../constants/routes";
import { useChoreographyForm } from "../../../hooks/useChoreographyForm";
import { useChoreographyGenerator } from "../../../hooks/useChoreographyGenerator";
import { GeneratingOverlay } from "../../../components/GeneratingOverlay";
import { Spinner } from "../../../components/Spinner";
import type { Plan } from "../../../constants/plans";
import type { ChoreographyDifficulty } from "../../../types/choreography";
import styles from "./page.module.css";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2 | 3;
const STEPS = ["Style", "Music", "Dancers", "Generate"] as const;

type WizardDancer = { id: string; name: string; color: string };
type Formation = "line" | "v-shape" | "diamond" | "circle" | "free";

type ItunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl?: string;
  artworkUrl60?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_DANCERS: WizardDancer[] = [
  { id: "d1", name: "Alex",   color: "#e85d5d" },
  { id: "d2", name: "Sam",    color: "#5d9be8" },
  { id: "d3", name: "Jordan", color: "#5de87a" },
  { id: "d4", name: "Morgan", color: "#e8c45d" },
  { id: "d5", name: "Taylor", color: "#c45de8" },
  { id: "d6", name: "Casey",  color: "#5de8d4" },
];

const DANCER_COLORS = ["#e85d5d","#5d9be8","#5de87a","#e8c45d","#c45de8","#5de8d4","#e8875d","#9b5de8"];
const DANCER_NAMES  = ["Alex","Sam","Jordan","Morgan","Taylor","Casey","Riley","Drew","Maya","Leo","Zoe","Kai"];

const FORMATION_POSITIONS: Record<Formation, [number, number][]> = {
  line:      [[0.15,0.5],[0.32,0.5],[0.5,0.5],[0.68,0.5],[0.85,0.5]],
  "v-shape": [[0.5,0.22],[0.28,0.55],[0.72,0.55],[0.12,0.82],[0.88,0.82]],
  diamond:   [[0.5,0.14],[0.18,0.5],[0.82,0.5],[0.5,0.86]],
  circle:    [[0.5,0.13],[0.84,0.34],[0.84,0.7],[0.5,0.88],[0.16,0.7],[0.16,0.34]],
  free:      [[0.22,0.28],[0.62,0.22],[0.82,0.52],[0.38,0.66],[0.14,0.72],[0.66,0.82]],
};

const DIFF_META = {
  Beginner:     { desc: "Simple cues, low impact",           dots: 1 },
  Intermediate: { desc: "Combinations + light syncopation",  dots: 2 },
  Advanced:     { desc: "Complex patterns, full range",      dots: 3 },
} as const;

// ── Mini stage (overhead dancer blobs) ────────────────────────────────────────

function MiniStage({ dancers, formation }: { dancers: WizardDancer[]; formation: Formation }) {
  const positions = FORMATION_POSITIONS[formation];
  const W = 240, H = 160;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.miniStage}>
      <rect width={W} height={H} fill="#0d0d0d" rx="8" />
      <ellipse cx={W/2} cy={H/2} rx={W*0.44} ry={H*0.42} fill="#181818" stroke="#262626" strokeWidth="1" />
      {dancers.map((d, i) => {
        const [xf, yf] = positions[i % positions.length];
        return (
          <g key={d.id} transform={`translate(${W * xf}, ${H * yf})`}>
            <defs>
              <radialGradient id={`blob-${d.id}`} cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor={d.color} stopOpacity="1" />
                <stop offset="100%" stopColor={d.color} stopOpacity="0.45" />
              </radialGradient>
            </defs>
            <ellipse cx="0" cy="0" rx="11" ry="14" fill={`url(#blob-${d.id})`} />
            <text x="0" y="4.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="white" opacity="0.9" fontFamily="sans-serif">
              {d.name[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

export function NewChoreographyClient({ plan }: { plan: Plan }) {
  const generator = useChoreographyGenerator();
  const form = useChoreographyForm();

  const [step, setStep] = useState<Step>(0);
  const [category, setCategory] = useState<"Dance" | "Fitness">("Dance");

  // Music step state
  const [bpm, setBpm] = useState(120);
  const [musicQuery, setMusicQuery] = useState("");
  const [musicResults, setMusicResults] = useState<ItunesTrack[]>([]);
  const [musicSearching, setMusicSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<ItunesTrack | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dancers step state
  const [dancers, setDancers] = useState<WizardDancer[]>(DEFAULT_DANCERS);
  const [formation, setFormation] = useState<Formation>("circle");

  // Generate step state
  const [brief, setBrief] = useState("");

  const styleList = category === "Dance" ? DANCE_STYLES : FITNESS_STYLES;

  // Stop audio on unmount
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  function handleCategoryChange(cat: "Dance" | "Fitness") {
    setCategory(cat);
    const list = cat === "Dance" ? DANCE_STYLES : FITNESS_STYLES;
    if (!(list as readonly string[]).includes(form.values.style)) {
      form.setStyle(list[0]);
    }
  }

  function handleMusicQueryChange(q: string) {
    setMusicQuery(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!q.trim()) { setMusicResults([]); return; }
    searchTimerRef.current = setTimeout(async () => {
      setMusicSearching(true);
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=6`,
        );
        const data = await res.json() as { results: ItunesTrack[] };
        setMusicResults(data.results ?? []);
      } catch {
        setMusicResults([]);
      } finally {
        setMusicSearching(false);
      }
    }, 500);
  }

  function togglePreview(track: ItunesTrack) {
    if (!track.previewUrl) return;
    if (playingId === track.trackId) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingId(null);
    } else {
      audioRef.current?.pause();
      const audio = new Audio(track.previewUrl);
      audio.play().catch(() => {});
      audio.onended = () => { setPlayingId(null); audioRef.current = null; };
      audioRef.current = audio;
      setPlayingId(track.trackId);
    }
  }

  function selectTrack(track: ItunesTrack) {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
    setSelectedTrack(track);
    setMusicResults([]);
  }

  function addDancer() {
    if (dancers.length >= 12) return;
    const i = dancers.length % DANCER_NAMES.length;
    setDancers((prev) => [...prev, { id: `d-${Date.now()}`, name: DANCER_NAMES[i], color: DANCER_COLORS[i % DANCER_COLORS.length] }]);
  }

  function removeDancer(id: string) {
    setDancers((prev) => prev.filter((d) => d.id !== id));
  }

  function handleGenerate() {
    const descParts = [
      brief.trim(),
      `Target BPM: ${bpm}.`,
      selectedTrack
        ? `Music reference: "${selectedTrack.trackName}" by ${selectedTrack.artistName}.`
        : "",
      `${dancers.length} dancers, starting in ${formation} formation.`,
    ].filter(Boolean);

    generator.generate(
      {
        ...form.values,
        targetAudience: form.values.targetAudience.trim() || "General",
        description: descParts.join(" "),
      },
      dancers,
    );
  }

  const canAdvance =
    step === 0 ? !!form.values.style && !!form.values.difficulty
    : step === 1 ? true
    : step === 2 ? dancers.length > 0
    : true;

  function goNext() { if (canAdvance) setStep((s) => Math.min(3, s + 1) as Step); }
  function goBack() { setStep((s) => Math.max(0, s - 1) as Step); }

  return (
    <div className={styles.page}>
      {generator.isGenerating && (
        <GeneratingOverlay plan={plan} style={form.values.style} bpm={bpm} />
      )}

      {/* Page header */}
      <div className={styles.pageHead}>
        <Link href={ROUTES.DASHBOARD} className={styles.backLink}>← Back to dashboard</Link>
        <h1 className={styles.pageTitle}>New choreography</h1>
      </div>

      {/* Step indicator */}
      <div className={styles.stepBar}>
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <button
              key={label}
              type="button"
              className={`${styles.stepItem} ${active ? styles.stepItemActive : ""} ${done ? styles.stepItemDone : ""}`}
              onClick={() => { if (done) setStep(i as Step); }}
              disabled={i > step}
            >
              <span className={styles.stepNum}>{done ? "✓" : i + 1}</span>
              <span className={styles.stepLabel}>{label}</span>
            </button>
          );
        })}
      </div>

      {generator.error && <div className={styles.errorBanner}>{generator.error}</div>}

      {/* ── Step 0: Style ──────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className={styles.stepPanel}>
          <div className={styles.stepHead}>
            <span className={styles.stepCrumb}>STEP 01 · STYLE</span>
            <h2 className={styles.stepTitle}>What kind of class?</h2>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Discipline</label>
            <div className={styles.categoryTabs}>
              {(["Dance", "Fitness"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={category === cat ? styles.categoryTabActive : styles.categoryTab}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Style</label>
            <div className={styles.styleGrid}>
              {styleList.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={form.values.style === s ? styles.styleOptActive : styles.styleOpt}
                  onClick={() => form.setStyle(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Difficulty</label>
            <div className={styles.diffRow}>
              {DIFFICULTIES.map((d) => {
                const meta = DIFF_META[d as keyof typeof DIFF_META];
                const active = form.values.difficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    className={active ? styles.diffBtnActive : styles.diffBtn}
                    onClick={() => form.setDifficulty(d as ChoreographyDifficulty)}
                  >
                    <span className={styles.diffBtnDots}>
                      {[0, 1, 2].map((n) => (
                        <span key={n} className={n < meta.dots ? styles.dotOn : styles.dot} />
                      ))}
                    </span>
                    <span className={styles.diffBtnName}>{d}</span>
                    <span className={styles.diffBtnDesc}>{meta.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Duration</label>
            <div className={styles.durationRow}>
              <span className={styles.durationVal}>
                {form.values.duration}
                <span className={styles.durationUnit}> min</span>
              </span>
              <input
                type="range"
                className={styles.rangeSlider}
                min={0}
                max={DURATIONS.length - 1}
                step={1}
                value={form.durationIndex}
                onChange={(e) => form.setDurationIndex(Number(e.target.value))}
              />
              <div className={styles.durationTicks}>
                {DURATIONS.map((d) => (
                  <span key={d} className={form.values.duration === d ? styles.tickActive : styles.tick}>{d}</span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              Who is this class for? <span className={styles.optional}>(optional)</span>
            </label>
            <input
              className={styles.fieldInput}
              value={form.values.targetAudience}
              onChange={(e) => form.setTargetAudience(e.target.value)}
              placeholder="e.g. Adult beginners, competitive teens, senior fitness group…"
            />
          </div>
        </div>
      )}

      {/* ── Step 1: Music ─────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className={styles.stepPanel}>
          <div className={styles.stepHead}>
            <span className={styles.stepCrumb}>STEP 02 · MUSIC</span>
            <h2 className={styles.stepTitle}>Set the beat</h2>
            <p className={styles.stepDesc}>
              Set the target BPM and search for a reference track. Claude will suggest music — this helps it nail the energy. Totally optional.
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              Target BPM · <span className={styles.bpmVal}>{bpm}</span>
            </label>
            <input
              type="range"
              className={styles.rangeSlider}
              min={60}
              max={180}
              step={1}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
            <div className={styles.bpmMarkers}>
              <span>60 slow</span>
              <span>90 walk</span>
              <span>120 medium</span>
              <span>150 fast</span>
              <span>180 intense</span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Reference track search</label>
            <div className={styles.searchWrap}>
              <input
                className={styles.fieldInput}
                value={musicQuery}
                onChange={(e) => handleMusicQueryChange(e.target.value)}
                placeholder={`Search by artist or song — e.g. "Bad Bunny" or "Blinding Lights"`}
              />
              {musicSearching && (
                <span className={styles.searchSpinner}><Spinner /></span>
              )}
            </div>

            {/* Selected track */}
            {selectedTrack && (
              <div className={styles.selectedTrack}>
                {selectedTrack.artworkUrl60 && (
                  <img src={selectedTrack.artworkUrl60} alt="" className={styles.trackArt} />
                )}
                <div className={styles.trackInfo}>
                  <div className={styles.trackName}>{selectedTrack.trackName}</div>
                  <div className={styles.trackArtist}>{selectedTrack.artistName}</div>
                </div>
                <button type="button" className={styles.trackClear} onClick={() => setSelectedTrack(null)}>
                  ×
                </button>
              </div>
            )}

            {/* Results list */}
            {musicResults.length > 0 && !selectedTrack && (
              <div className={styles.searchResults}>
                {musicResults.map((track) => (
                  <div key={track.trackId} className={styles.searchResult}>
                    {track.artworkUrl60 && (
                      <img src={track.artworkUrl60} alt="" className={styles.resultArt} />
                    )}
                    <div className={styles.resultInfo}>
                      <div className={styles.resultName}>{track.trackName}</div>
                      <div className={styles.resultArtist}>{track.artistName}</div>
                    </div>
                    <div className={styles.resultActions}>
                      {track.previewUrl && (
                        <button
                          type="button"
                          className={`${styles.previewBtn} ${playingId === track.trackId ? styles.previewBtnActive : ""}`}
                          onClick={() => togglePreview(track)}
                        >
                          {playingId === track.trackId ? "■" : "▶"}
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.selectBtn}
                        onClick={() => selectTrack(track)}
                      >
                        Use
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {musicQuery && !musicSearching && musicResults.length === 0 && !selectedTrack && (
              <div className={styles.searchEmpty}>No results — try a different search</div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2: Dancers ───────────────────────────────────────────────── */}
      {step === 2 && (
        <div className={styles.stepPanel}>
          <div className={styles.stepHead}>
            <span className={styles.stepCrumb}>STEP 03 · DANCERS</span>
            <h2 className={styles.stepTitle}>Who's on stage?</h2>
            <p className={styles.stepDesc}>
              Name your dancers and pick a starting formation. Claude assigns positions per move — you can edit later.
            </p>
          </div>

          <div className={styles.dancersLayout}>
            {/* Roster */}
            <div className={styles.rosterCard}>
              <div className={styles.rosterHead}>
                <span className={styles.fieldLabel}>ROSTER · {dancers.length}</span>
              </div>
              <div className={styles.rosterList}>
                {dancers.map((d) => (
                  <div key={d.id} className={styles.rosterRow}>
                    <span className={styles.rosterAvatar} style={{ background: d.color }}>
                      {d.name[0] || "?"}
                    </span>
                    <input
                      className={styles.rosterName}
                      value={d.name}
                      onChange={(e) => setDancers((prev) => prev.map((x) => x.id === d.id ? { ...x, name: e.target.value } : x))}
                      placeholder="Name"
                    />
                    <button
                      type="button"
                      className={styles.rosterRemove}
                      onClick={() => removeDancer(d.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={styles.addDancerBtn}
                onClick={addDancer}
                disabled={dancers.length >= 12}
              >
                + Add dancer
              </button>
            </div>

            {/* Formation */}
            <div className={styles.formationCard}>
              <span className={styles.fieldLabel}>STARTING FORMATION</span>
              <MiniStage dancers={dancers} formation={formation} />
              <div className={styles.formationPresets}>
                {(["line","v-shape","diamond","circle","free"] as Formation[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={formation === f ? styles.presetBtnActive : styles.presetBtn}
                    onClick={() => setFormation(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Generate ──────────────────────────────────────────────── */}
      {step === 3 && (
        <div className={styles.stepPanel}>
          <div className={styles.stepHead}>
            <span className={styles.stepCrumb}>STEP 04 · GENERATE</span>
            <h2 className={styles.stepTitle}>Ready to compose</h2>
            <p className={styles.stepDesc}>Review your setup and add any extra cues, then let Claude compose your full sequence.</p>
          </div>

          {/* Summary card */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span className={styles.sumKey}>Style</span>
              <span className={styles.sumVal}>{form.values.style}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.sumKey}>Difficulty</span>
              <span className={styles.sumVal}>{form.values.difficulty}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.sumKey}>Duration</span>
              <span className={styles.sumVal}>{form.values.duration} min</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.sumKey}>BPM</span>
              <span className={styles.sumVal}>{bpm}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.sumKey}>Dancers</span>
              <span className={styles.sumVal}>{dancers.length} · {formation}</span>
            </div>
            {form.values.targetAudience && (
              <div className={styles.summaryRow}>
                <span className={styles.sumKey}>Audience</span>
                <span className={styles.sumVal}>{form.values.targetAudience}</span>
              </div>
            )}
            {selectedTrack && (
              <div className={styles.summaryRow}>
                <span className={styles.sumKey}>Music ref</span>
                <span className={styles.sumVal}>{selectedTrack.trackName} — {selectedTrack.artistName}</span>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              Extra cues for Claude <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              className={styles.briefArea}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="e.g. Peak energy at minute 20, focus on arm isolations, avoid floor work, include a 2-minute cool-down…"
              rows={3}
            />
          </div>

          <button
            type="button"
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={generator.isGenerating}
          >
            {generator.isGenerating ? (
              <><Spinner /> Generating…</>
            ) : (
              "✦ Generate with Claude"
            )}
          </button>
        </div>
      )}

      {/* Bottom nav */}
      <div className={styles.stepNav}>
        {step > 0 && (
          <button type="button" className={styles.stepNavBack} onClick={goBack}>
            ← Back
          </button>
        )}
        <div className={styles.stepNavRight}>
          {step < 3 && (
            <button
              type="button"
              className={styles.stepNavContinue}
              onClick={goNext}
              disabled={!canAdvance}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
