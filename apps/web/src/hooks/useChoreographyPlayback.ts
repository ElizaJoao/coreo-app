"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChoreographyMove } from "../types/choreography";
import { PLAYBACK_TICK_MS } from "../constants/playback";

export function useChoreographyPlayback(moves: ChoreographyMove[]) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const totalSec = moves.reduce((s, m) => s + m.duration, 0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= totalSec) {
          setPlaying(false);
          return totalSec;
        }
        return next;
      });
    }, PLAYBACK_TICK_MS);
    return () => clearInterval(t);
  }, [playing, totalSec]);

  // Compute active move index from cumulative durations
  const activeMoveIndex = (() => {
    let cumulative = 0;
    for (let i = 0; i < moves.length; i++) {
      if (elapsed < cumulative + moves[i].duration) return i;
      cumulative += moves[i].duration;
    }
    return Math.max(0, moves.length - 1);
  })();

  const progress = totalSec > 0 ? elapsed / totalSec : 0;

  const toggle = useCallback(() => setPlaying((p) => !p), []);

  const seek = useCallback(
    (sec: number) => setElapsed(Math.max(0, Math.min(totalSec, Math.floor(sec)))),
    [totalSec],
  );

  const seekToMove = useCallback(
    (index: number) => {
      let cum = 0;
      for (let i = 0; i < index; i++) cum += moves[i].duration;
      setElapsed(cum);
    },
    [moves],
  );

  return {
    playing,
    elapsed,
    totalSec,
    activeMoveIndex,
    progress,
    toggle,
    seek,
    seekToMove,
  };
}
