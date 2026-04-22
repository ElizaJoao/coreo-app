import type { ChoreographyMove } from "../types/choreography";
import styles from "./MoveRow.module.css";

export type MoveRowProps = {
  move: ChoreographyMove;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<ChoreographyMove>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  plan?: "free" | "pro" | "max";
};

export function MoveRow(props: MoveRowProps) {
  const { move, plan = "free" } = props;
  const isPro = plan === "pro" || plan === "max";
  const isMax = plan === "max";

  return (
    <div className={styles.row}>
      <div className={styles.orderCol}>
        <span className={styles.orderNum}>{move.order}</span>
        <div className={styles.arrows}>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={props.onMoveUp}
            disabled={props.isFirst}
            aria-label="Move up"
          >▲</button>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={props.onMoveDown}
            disabled={props.isLast}
            aria-label="Move down"
          >▼</button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.topLine}>
          <input
            className={styles.nameInput}
            value={move.name}
            onChange={(e) => props.onUpdate({ name: e.target.value })}
            placeholder="Move name"
          />
          <div className={styles.durationField}>
            <input
              type="number"
              className={styles.durationInput}
              value={move.duration}
              min={5}
              max={600}
              onChange={(e) => props.onUpdate({ duration: Number(e.target.value) })}
            />
            <span className={styles.durationUnit}>s</span>
          </div>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={props.onDelete}
            aria-label="Delete move"
          >✕</button>
        </div>
        <textarea
          className={styles.descInput}
          value={move.description}
          rows={2}
          placeholder="Instructor cue or description…"
          onChange={(e) => props.onUpdate({ description: e.target.value })}
        />

        {isMax && move.verbalCue && (
          <div className={styles.verbalCue}>
            <span className={styles.verbalCueLabel}>💬 Say:</span>
            <span className={styles.verbalCueText}>{move.verbalCue}</span>
          </div>
        )}

        {isPro && move.videoQuery && (
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(move.videoQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.videoLink}
          >
            🎬 Watch demo
          </a>
        )}
      </div>
    </div>
  );
}
