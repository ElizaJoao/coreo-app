import styles from "./BpmPill.module.css";

export type BpmPillProps = {
  bpm: number;
  beating?: boolean;
};

export function BpmPill({ bpm, beating = false }: BpmPillProps) {
  const dur = 60 / bpm;
  return (
    <span className={styles.pill}>
      <span
        className={styles.pulse}
        style={{
          animationDuration: `${dur}s`,
          animationPlayState: beating ? "running" : "paused",
        }}
      />
      {bpm} BPM
    </span>
  );
}
