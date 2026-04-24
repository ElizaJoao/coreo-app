"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { ChoreographyMove, Dancer, DancerPosition } from "../types/choreography";
import styles from "./FormationEditor.module.css";

const DANCER_COLORS = [
  "#F5C842", "#7C5CFC", "#22C55E", "#F97316",
  "#06B6D4", "#EC4899", "#EF4444", "#14B8A6",
  "#A855F7", "#3B82F6",
];

function nextColor(dancers: Dancer[]) {
  return DANCER_COLORS[dancers.length % DANCER_COLORS.length];
}

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

type Props = {
  moves: ChoreographyMove[];
  dancers: Dancer[];
  onDancersChange: (d: Dancer[]) => void;
  getFormationForMove: (moveId: string) => Record<string, DancerPosition>;
  onUpdatePosition: (moveId: string, dancerId: string, pos: DancerPosition) => void;
};

export function FormationEditor({ moves, dancers, onDancersChange, getFormationForMove, onUpdatePosition }: Props) {
  const t = useTranslations("formation");
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeMoveIdx, setActiveMoveIdx] = useState(0);
  const [dragging, setDragging] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);

  const activeMove = moves[activeMoveIdx];
  const positions = activeMove ? getFormationForMove(activeMove.id) : {};

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !activeMove || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0.04, Math.min(0.96, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0.04, Math.min(0.96, (e.clientY - rect.top) / rect.height));
    onUpdatePosition(activeMove.id, dragging, { x, y });
  }, [dragging, activeMove, onUpdatePosition]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  function addDancer() {
    const id = `dancer-${Date.now()}`;
    const color = nextColor(dancers);
    const newDancer: Dancer = { id, name: `Dancer ${dancers.length + 1}`, color };
    const defaultPos = defaultPosition(dancers.length, dancers.length + 1);
    onDancersChange([...dancers, newDancer]);
    if (activeMove) onUpdatePosition(activeMove.id, id, defaultPos);
  }

  function removeDancer(id: string) {
    onDancersChange(dancers.filter((d) => d.id !== id));
  }

  function renameDancer(id: string, name: string) {
    onDancersChange(dancers.map((d) => (d.id === id ? { ...d, name } : d)));
  }

  function copyFromPrev() {
    if (!activeMove || activeMoveIdx === 0) return;
    const prevMove = moves[activeMoveIdx - 1];
    const prevPositions = getFormationForMove(prevMove.id);
    Object.entries(prevPositions).forEach(([dancerId, pos]) => {
      onUpdatePosition(activeMove.id, dancerId, pos);
    });
  }

  return (
    <div className={styles.editor}>
      {/* Move tabs */}
      <div className={styles.moveTabs}>
        {moves.map((m, i) => (
          <button
            key={m.id}
            type="button"
            className={i === activeMoveIdx ? styles.moveTabActive : styles.moveTab}
            onClick={() => setActiveMoveIdx(i)}
          >
            <span className={styles.moveTabNum}>{i + 1}</span>
            <span className={styles.moveTabName}>{m.name}</span>
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {/* Stage */}
        <div className={styles.stageWrap}>
          <div className={styles.stageLabel}>{t("stage")}</div>
          <div
            ref={stageRef}
            className={styles.stage}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid lines */}
            <div className={styles.stageLine} style={{ top: "33.3%" }} />
            <div className={styles.stageLine} style={{ top: "66.6%" }} />
            <div className={styles.stageLineV} style={{ left: "33.3%" }} />
            <div className={styles.stageLineV} style={{ left: "66.6%" }} />
            <div className={styles.stageAudience}>{t("audience")}</div>

            {/* Dancers */}
            {dancers.map((dancer) => {
              const pos = positions[dancer.id] ?? defaultPosition(dancers.indexOf(dancer), dancers.length);
              return (
                <div
                  key={dancer.id}
                  className={`${styles.dancerToken} ${dragging === dancer.id ? styles.dancerTokenDragging : ""}`}
                  style={{
                    left: `${pos.x * 100}%`,
                    top: `${pos.y * 100}%`,
                    background: dancer.color,
                    transform: "translate(-50%, -50%)",
                  }}
                  onMouseDown={(e) => { e.preventDefault(); setDragging(dancer.id); }}
                >
                  {dancer.name.charAt(0).toUpperCase()}
                </div>
              );
            })}

            {dancers.length === 0 && (
              <div className={styles.stageEmpty}>{t("addDancers")}</div>
            )}
          </div>

          {activeMoveIdx > 0 && (
            <button type="button" className={styles.copyBtn} onClick={copyFromPrev}>
              {t("copyFromPrev")}
            </button>
          )}
        </div>

        {/* Dancer panel */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>{t("dancers")}</div>

          <div className={styles.dancerList}>
            {dancers.map((dancer) => (
              <div key={dancer.id} className={styles.dancerRow}>
                <div className={styles.dancerDot} style={{ background: dancer.color }} />
                {editingName === dancer.id ? (
                  <input
                    className={styles.dancerNameInput}
                    autoFocus
                    value={dancer.name}
                    onChange={(e) => renameDancer(dancer.id, e.target.value)}
                    onBlur={() => setEditingName(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingName(null)}
                  />
                ) : (
                  <button
                    type="button"
                    className={styles.dancerName}
                    onClick={() => setEditingName(dancer.id)}
                  >
                    {dancer.name}
                  </button>
                )}
                <button
                  type="button"
                  className={styles.dancerRemove}
                  onClick={() => removeDancer(dancer.id)}
                  aria-label="Remove dancer"
                >✕</button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={styles.addDancerBtn}
            onClick={addDancer}
            disabled={dancers.length >= 10}
          >
            {t("addDancer")}
          </button>

          <div className={styles.hint}>{t("hint")}</div>
        </div>
      </div>
    </div>
  );
}
