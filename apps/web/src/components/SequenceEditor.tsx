import type { ChoreographyMove, ChoreographyMusic } from "../types/choreography";
import type { EditorStatus } from "../hooks/useChoreographyEditor";
import { MoveRow } from "./MoveRow";
import { MusicEditor } from "./MusicEditor";
import styles from "./SequenceEditor.module.css";

export type SequenceEditorProps = {
  name: string;
  onNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  moves: ChoreographyMove[];
  onUpdateMove: (id: string, patch: Partial<ChoreographyMove>) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDeleteMove: (id: string) => void;
  onAddMove: () => void;
  music?: ChoreographyMusic;
  onUpdateMusic: (patch: Partial<ChoreographyMusic>) => void;
  onClearMusic: () => void;
  status: EditorStatus;
  onSave: () => void;
};

export function SequenceEditor(props: SequenceEditorProps) {
  const totalSec = props.moves.reduce((s, m) => s + m.duration, 0);
  const totalMin = Math.floor(totalSec / 60);
  const remSec = totalSec % 60;

  return (
    <div className={styles.editor}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <input
            className={styles.nameInput}
            value={props.name}
            onChange={(e) => props.onNameChange(e.target.value)}
            placeholder="Choreography name"
          />
          <span className={styles.duration}>
            {totalMin}:{remSec.toString().padStart(2, "0")} total
          </span>
        </div>
        <textarea
          className={styles.descInput}
          value={props.description}
          onChange={(e) => props.onDescriptionChange(e.target.value)}
          placeholder="Notes or description…"
          rows={2}
        />
      </div>

      {/* Move sequence */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Sequence</h2>
        <div className={styles.moveList}>
          {props.moves.map((move, i) => (
            <MoveRow
              key={move.id}
              move={move}
              index={i}
              isFirst={i === 0}
              isLast={i === props.moves.length - 1}
              onUpdate={(patch) => props.onUpdateMove(move.id, patch)}
              onMoveUp={() => props.onMoveUp(i)}
              onMoveDown={() => props.onMoveDown(i)}
              onDelete={() => props.onDeleteMove(move.id)}
            />
          ))}
        </div>
        <button type="button" className={styles.addBtn} onClick={props.onAddMove}>
          + Add move
        </button>
      </div>

      {/* Music */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Music</h2>
        <MusicEditor
          music={props.music}
          onUpdate={props.onUpdateMusic}
          onClear={props.onClearMusic}
        />
      </div>

      {/* Save */}
      <div className={styles.saveRow}>
        {props.status === "error" && (
          <span className={styles.saveError}>Failed to save. Try again.</span>
        )}
        {props.status === "saved" && (
          <span className={styles.saveSuccess}>Saved!</span>
        )}
        <button
          type="button"
          className={styles.saveBtn}
          onClick={props.onSave}
          disabled={props.status === "saving"}
        >
          {props.status === "saving" ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
