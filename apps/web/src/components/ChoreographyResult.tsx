import type { Choreography } from "../types/choreography";
import styles from "./ChoreographyResult.module.css";

export type ChoreographyResultProps = {
  choreography: Choreography;
};

export function ChoreographyResult({ choreography }: ChoreographyResultProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.name}>{choreography.name}</h2>
        <div className={styles.meta}>
          <span className={styles.badgeAccent}>{choreography.style}</span>
          <span className={styles.badge}>{choreography.duration} min</span>
          <span className={styles.badge}>{choreography.difficulty}</span>
          <span className={styles.badge}>{choreography.targetAudience}</span>
        </div>
      </div>

      {choreography.music ? (
        <div className={styles.music}>
          <p className={styles.musicLabel}>Suggested music</p>
          <p className={styles.musicTitle}>{choreography.music.title}</p>
          <p className={styles.musicSub}>
            {choreography.music.artist} · {choreography.music.bpm} BPM
          </p>
        </div>
      ) : null}

      <div className={styles.movesSection}>
        <p className={styles.movesTitle}>Sequence — {choreography.moves.length} moves</p>
        <div className={styles.moveList}>
          {choreography.moves.map((move) => (
            <div key={move.id} className={styles.move}>
              <span className={styles.moveOrder}>{move.order}</span>
              <div className={styles.moveBody}>
                <p className={styles.moveName}>{move.name}</p>
                <p className={styles.moveMeta}>{move.duration}s</p>
                <p className={styles.moveDesc}>{move.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
