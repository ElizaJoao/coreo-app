"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChoreographyMove } from "../types/choreography";
import styles from "./RehearsalMode.module.css";

type Props = {
  moves: ChoreographyMove[];
  onClose: () => void;
};

export function RehearsalMode({ moves, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(moves[0]?.duration ?? 0);
  const [paused, setPaused] = useState(false);

  const current = moves[currentIndex];
  const next = moves[currentIndex + 1];
  const isLast = currentIndex === moves.length - 1;

  const goNext = useCallback(() => {
    if (isLast) { onClose(); return; }
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setSecondsLeft(moves[nextIdx].duration);
  }, [currentIndex, isLast, moves, onClose]);

  useEffect(() => {
    if (paused) return;
    if (secondsLeft <= 0) { goNext(); return; }
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft, paused, goNext]);

  const progress = current ? 1 - secondsLeft / current.duration : 0;

  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;

  return (
    <div className={styles.overlay}>
      <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Exit rehearsal">✕</button>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
      </div>

      <div className={styles.counter}>
        {currentIndex + 1} / {moves.length}
      </div>

      <div className={styles.content}>
        <div className={styles.moveName}>{current?.name}</div>

        <div className={styles.timer}>
          {min}:{sec.toString().padStart(2, "0")}
        </div>

        {current?.verbalCue && (
          <div className={styles.cueBox}>
            <span className={styles.cueLabel}>💬 Say:</span>
            <span className={styles.cueText}>{current.verbalCue}</span>
          </div>
        )}

        {current?.description && (
          <p className={styles.description}>{current.description}</p>
        )}

        {next && (
          <div className={styles.nextUp}>
            Up next → <strong>{next.name}</strong>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.controlBtn}
          onClick={() => {
            if (currentIndex > 0) {
              const prevIdx = currentIndex - 1;
              setCurrentIndex(prevIdx);
              setSecondsLeft(moves[prevIdx].duration);
            }
          }}
          disabled={currentIndex === 0}
        >
          ← Prev
        </button>

        <button
          type="button"
          className={styles.pauseBtn}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>

        <button
          type="button"
          className={styles.controlBtn}
          onClick={goNext}
        >
          {isLast ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
}
