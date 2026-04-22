"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ChoreographyMove, ChoreographyMusic, Dancer, DancerPosition } from "../types/choreography";
import styles from "./FormationPlayback.module.css";

type Props = {
  moves: ChoreographyMove[];
  dancers: Dancer[];
  getFormationForMove: (moveId: string) => Record<string, DancerPosition>;
  music?: ChoreographyMusic;
  onClose: () => void;
};

const SPEEDS = [0.5, 1, 2, 4] as const;
type Speed = (typeof SPEEDS)[number];

function defaultPosition(index: number, total: number): DancerPosition {
  const cols = Math.ceil(Math.sqrt(total));
  const col = index % cols;
  const row = Math.floor(index / cols);
  const totalRows = Math.ceil(total / cols);
  return {
    x: 0.15 + (col / Math.max(cols - 1, 1)) * 0.7,
    y: 0.3 + (row / Math.max(totalRows - 1, 1)) * 0.4,
  };
}

// --- BPM metronome via Web Audio API ---
function scheduleClick(ctx: AudioContext, time: number, accent: boolean) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = accent ? 1200 : 880;
  gain.gain.setValueAtTime(accent ? 0.35 : 0.18, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  osc.start(time);
  osc.stop(time + 0.04);
}

function createMetronome(bpm: number) {
  const ctx = new AudioContext();
  let nextBeat = ctx.currentTime + 0.05;
  let beat = 0;
  let rafId = 0;

  function tick() {
    while (nextBeat < ctx.currentTime + 0.15) {
      scheduleClick(ctx, nextBeat, beat % 4 === 0);
      nextBeat += 60 / bpm;
      beat++;
    }
    rafId = requestAnimationFrame(tick);
  }

  tick();
  return { ctx, stop: () => { cancelAnimationFrame(rafId); ctx.close(); } };
}

export function FormationPlayback({ moves, dancers, getFormationForMove, music, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0); // seconds elapsed in current move
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [metronomeOn, setMetronomeOn] = useState(false);

  const metronomeRef = useRef<{ ctx: AudioContext; stop: () => void } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = moves[currentIndex];
  const next = moves[currentIndex + 1];
  const isLast = currentIndex === moves.length - 1;
  const moveDuration = current?.duration ?? 1;
  const secondsLeft = Math.max(0, moveDuration - Math.floor(elapsed));

  const goNext = useCallback(() => {
    if (isLast) { onClose(); return; }
    setCurrentIndex((i) => i + 1);
    setElapsed(0);
  }, [isLast, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
    setElapsed(0);
  }, [currentIndex]);

  // Timer — fires every 100ms, advances elapsed by (speed * 0.1)s
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + speed * 0.1;
        return next;
      });
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, speed]);

  // Auto-advance when elapsed reaches move duration
  useEffect(() => {
    if (elapsed >= moveDuration) goNext();
  }, [elapsed, moveDuration, goNext]);

  // Metronome toggle
  useEffect(() => {
    if (metronomeOn && !paused && music?.bpm) {
      const bpm = music.bpm * speed;
      metronomeRef.current = createMetronome(bpm);
    } else {
      metronomeRef.current?.stop();
      metronomeRef.current = null;
    }
    return () => { metronomeRef.current?.stop(); metronomeRef.current = null; };
  }, [metronomeOn, paused, speed, music?.bpm]);

  // Cleanup on unmount
  useEffect(() => () => { metronomeRef.current?.stop(); }, []);

  const positions = current ? getFormationForMove(current.id) : {};
  const progress = Math.min(elapsed / moveDuration, 1);
  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;

  const musicQuery = music
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${music.artist} ${music.title}`)}`
    : null;

  return (
    <div className={styles.overlay}>
      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Top info row */}
      <div className={styles.topBar}>
        <span className={styles.moveCounter}>{currentIndex + 1} / {moves.length}</span>
        <span className={styles.moveName}>{current?.name}</span>
        <span className={styles.timer}>{min}:{sec.toString().padStart(2, "0")}</span>
      </div>

      {/* Stage */}
      <div className={styles.stageWrap}>
        <div className={styles.stage}>
          <div className={styles.stageLine} style={{ top: "33.3%" }} />
          <div className={styles.stageLine} style={{ top: "66.6%" }} />
          <div className={styles.stageLineV} style={{ left: "33.3%" }} />
          <div className={styles.stageLineV} style={{ left: "66.6%" }} />
          <div className={styles.stageAudience}>Audience</div>

          {dancers.map((dancer, i) => {
            const pos = positions[dancer.id] ?? defaultPosition(i, dancers.length);
            return (
              <div
                key={dancer.id}
                className={styles.dancerToken}
                style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, background: dancer.color }}
              >
                <span className={styles.dancerInitial}>{dancer.name.charAt(0).toUpperCase()}</span>
                <span className={styles.dancerLabel}>{dancer.name}</span>
              </div>
            );
          })}
        </div>

        {next && (
          <div className={styles.nextPreview}>
            <span className={styles.nextLabel}>Next →</span>
            <span className={styles.nextName}>{next.name}</span>
          </div>
        )}
      </div>

      {/* Music bar — always visible */}
      {music && (
        <div className={styles.musicBar}>
          <span className={styles.musicNote}>♪</span>
          <span className={styles.musicText}>{music.artist} — {music.title}</span>
          {music.bpm && <span className={styles.bpmPill}>{music.bpm} BPM</span>}
          <button
            type="button"
            className={metronomeOn ? styles.metronomeBtnOn : styles.metronomeBtn}
            onClick={() => setMetronomeOn((v) => !v)}
            title="Toggle BPM click track"
          >
            {metronomeOn ? "🔔 Beat on" : "🔕 Beat off"}
          </button>
          {musicQuery && (
            <a
              href={musicQuery}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.youtubeLink}
            >
              ▶ Open on YouTube
            </a>
          )}
        </div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        {/* Speed */}
        <div className={styles.speedGroup}>
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              className={speed === s ? styles.speedBtnActive : styles.speedBtn}
              onClick={() => setSpeed(s)}
            >
              {s}×
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        <button type="button" className={styles.controlBtn} onClick={goPrev} disabled={currentIndex === 0}>← Prev</button>
        <button type="button" className={styles.pauseBtn} onClick={() => setPaused((p) => !p)}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
        <button type="button" className={styles.controlBtn} onClick={goNext}>{isLast ? "Finish" : "Next →"}</button>

        <div className={styles.divider} />
        <button type="button" className={styles.closeBtn} onClick={onClose}>✕ Exit</button>
      </div>
    </div>
  );
}