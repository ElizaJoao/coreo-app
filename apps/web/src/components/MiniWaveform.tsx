import { useMemo } from "react";

import { makeWaveform } from "../lib/waveform";
import styles from "./MiniWaveform.module.css";

export type MiniWaveformProps = {
  seed: number;
  count?: number;
};

export function MiniWaveform({ seed, count = 28 }: MiniWaveformProps) {
  const bars = useMemo(() => makeWaveform(seed, count), [seed, count]);
  return (
    <div className={styles.wave}>
      {bars.map((b, i) => (
        <div key={i} className={styles.bar} style={{ height: `${Math.max(15, b * 100)}%` }} />
      ))}
    </div>
  );
}
