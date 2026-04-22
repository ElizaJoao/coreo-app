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

export function FormationPlayback({ moves, dancers, getFormationForMove, music, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(moves[0]?.duration ?? 0);
  const [paused, setPaused] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = moves[currentIndex];
  const next = moves[currentIndex + 1];
  const isLast = currentIndex === moves.length - 1;

  const goNext = useCallback(() => {
    if (isLast) { onClose(); return; }
    const idx = currentIndex + 1;
    setCurrentIndex(idx);
    setSecondsLeft(moves[idx].duration);
  }, [currentIndex, isLast, moves, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex === 0) return;
    const idx = currentIndex - 1;
    setCurrentIndex(idx);
    setSecondsLeft(moves[idx].duration);
  }, [currentIndex, moves]);

  useEffect(() => {
    if (paused) return;
    if (secondsLeft <= 0) { goNext(); return; }
    timerRef.current = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [secondsLeft, paused, goNext]);

  const positions = current ? getFormationForMove(current.id) : {};
  const progress = current ? 1 - secondsLeft / current.duration : 0;
  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;

  const musicQuery = music ? encodeURIComponent(`${music.artist} - ${music.title}`) : null;

  return (
    <div className={styles.overlay}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
        </div>
        <div className={styles.topInfo}>
          <span className={styles.moveCounter}>{currentIndex + 1} / {moves.length}</span>
          <span className={styles.moveName}>{current?.name}</span>
          <span className={styles.timer}>{min}:{sec.toString().padStart(2, "0")}</span>
        </div>
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
                style={{
                  left: `${pos.x * 100}%`,
                  top: `${pos.y * 100}%`,
                  background: dancer.color,
                }}
              >
                <span className={styles.dancerInitial}>{dancer.name.charAt(0).toUpperCase()}</span>
                <span className={styles.dancerLabel}>{dancer.name}</span>
              </div>
            );
          })}
        </div>

        {/* Next move preview */}
        {next && (
          <div className={styles.nextPreview}>
            <span className={styles.nextLabel}>Next →</span>
            <span className={styles.nextName}>{next.name}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button type="button" className={styles.controlBtn} onClick={goPrev} disabled={currentIndex === 0}>← Prev</button>
        <button type="button" className={styles.pauseBtn} onClick={() => setPaused((p) => !p)}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
        <button type="button" className={styles.controlBtn} onClick={goNext}>{isLast ? "Finish" : "Next →"}</button>

        {music && (
          <button type="button" className={styles.musicBtn} onClick={() => setShowMusic((v) => !v)}>
            ♪ {showMusic ? "Hide music" : "Music"}
          </button>
        )}
        <button type="button" className={styles.closeBtn} onClick={onClose}>✕ Exit</button>
      </div>

      {/* YouTube music panel */}
      {showMusic && musicQuery && (
        <div className={styles.musicPanel}>
          <div className={styles.musicTitle}>
            {music?.title} — {music?.artist}
            {music?.bpm && <span className={styles.bpmTag}>{music.bpm} BPM</span>}
          </div>
          <iframe
            className={styles.youtubeFrame}
            src={`https://www.youtube.com/embed?listType=search&list=${musicQuery}&autoplay=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
