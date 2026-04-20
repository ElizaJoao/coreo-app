import { useMemo } from "react";

import { makeWaveform } from "../lib/waveform";
import styles from "./StatWave.module.css";

export type StatWaveProps = {
  seed: number;
  bars?: number;
};

export function StatWave({ seed, bars = 12 }: StatWaveProps) {
  const ws = useMemo(() => makeWaveform(seed, bars), [seed, bars]);
  return (
    <div className={styles.wave}>
      {ws.map((b, i) => (
        <div
          key={i}
          className={styles.bar}
          style={{ height: `${b * 100}%`, opacity: 0.4 + b * 0.5 }}
        />
      ))}
    </div>
  );
}
