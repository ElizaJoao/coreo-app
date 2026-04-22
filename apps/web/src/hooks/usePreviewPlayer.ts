"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ChoreographyMove } from "../types/choreography";

export type PreviewSpeed = 0.5 | 1 | 2 | 4;
export const PREVIEW_SPEEDS: PreviewSpeed[] = [0.5, 1, 2, 4];

export function usePreviewPlayer(moves: ChoreographyMove[], onClose: () => void) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<PreviewSpeed>(1);
  const [videoIds, setVideoIds] = useState<Record<string, string | null>>({});

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

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setElapsed(0);
  }, []);

  // Timer
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setElapsed((e) => e + speed * 0.1);
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, speed]);

  // Auto-advance
  useEffect(() => {
    if (elapsed >= moveDuration) goNext();
  }, [elapsed, moveDuration, goNext]);

  // Resolve video ID for current move + prefetch next
  useEffect(() => {
    async function resolve(move: ChoreographyMove) {
      if (!move.videoQuery) return;
      if (videoIds[move.id] !== undefined) return;
      try {
        const res = await fetch(`/api/youtube/resolve?q=${encodeURIComponent(move.videoQuery)}`);
        const data = await res.json() as { videoId: string | null };
        setVideoIds((prev) => ({ ...prev, [move.id]: data.videoId }));
      } catch {
        setVideoIds((prev) => ({ ...prev, [move.id]: null }));
      }
    }

    if (current) resolve(current);
    if (next) resolve(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const progress = Math.min(
    (moves.slice(0, currentIndex).reduce((s, m) => s + m.duration, 0) + elapsed) /
      Math.max(moves.reduce((s, m) => s + m.duration, 0), 1),
    1,
  );

  return {
    current,
    next,
    currentIndex,
    isLast,
    elapsed,
    secondsLeft,
    paused,
    setPaused,
    speed,
    setSpeed,
    videoIds,
    progress,
    goNext,
    goPrev,
    goTo,
  };
}
