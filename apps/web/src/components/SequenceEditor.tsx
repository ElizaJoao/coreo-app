"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ChoreographyMove, ChoreographyMusic, Dancer, DancerPosition } from "../types/choreography";
import type { EditorStatus } from "../hooks/useChoreographyEditor";
import type { Plan } from "../constants/plans";
import { MoveRow } from "./MoveRow";
import { MusicEditor } from "./MusicEditor";
import { RehearsalMode } from "./RehearsalMode";
import { FormationEditor } from "./FormationEditor";
import { FormationPlayback } from "./FormationPlayback";
import { PreviewPlayer } from "./PreviewPlayer";
import { PublishPackModal } from "./PublishPackModal";
import styles from "./SequenceEditor.module.css";

export type SequenceEditorProps = {
  choreographyId: string;
  plan: Plan;
  name: string;
  onNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  style: string;
  difficulty: string;
  duration: number;
  targetAudience: string;
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
  dancers: Dancer[];
  onDancersChange: (d: Dancer[]) => void;
  getFormationForMove: (moveId: string) => Record<string, DancerPosition>;
  onUpdatePosition: (moveId: string, dancerId: string, pos: DancerPosition) => void;
};

export function SequenceEditor(props: SequenceEditorProps) {
  const { plan, choreographyId } = props;
  const isPro = plan === "pro" || plan === "max";
  const isMax = plan === "max";
  const te = useTranslations("editor");
  const tp = useTranslations("plans");

  const [tagInput, setTagInput] = useState("");
  const [rehearsalOpen, setRehearsalOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [formationPlaybackOpen, setFormationPlaybackOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalSec = props.moves.reduce((s, m) => s + m.duration, 0);
  const totalMin = Math.floor(totalSec / 60);
  const remSec = totalSec % 60;

  function handleShare() {
    const url = `${window.location.origin}/share/${choreographyId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      {isMax && rehearsalOpen && (
        <RehearsalMode moves={props.moves} onClose={() => setRehearsalOpen(false)} />
      )}
      {isPro && formationPlaybackOpen && (
        <FormationPlayback
          moves={props.moves}
          dancers={props.dancers}
          getFormationForMove={props.getFormationForMove}
          music={props.music}
          onClose={() => setFormationPlaybackOpen(false)}
        />
      )}
      {isPro && publishOpen && (
        <PublishPackModal
          choreographyId={choreographyId}
          initialTitle={props.name}
          style={props.style}
          difficulty={props.difficulty}
          duration={props.duration}
          targetAudience={props.targetAudience}
          moves={props.moves}
          music={props.music}
          onClose={() => setPublishOpen(false)}
          onPublished={() => { setPublishOpen(false); }}
        />
      )}
      {isPro && previewOpen && (
        <PreviewPlayer
          moves={props.moves}
          music={props.music}
          plan={plan}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <div className={styles.editor}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <input
              className={styles.nameInput}
              value={props.name}
              onChange={(e) => props.onNameChange(e.target.value)}
              placeholder={te("choreographyName")}
            />
            <span className={plan === "max" ? styles.planBadgeMax : plan === "pro" ? styles.planBadgePro : styles.planBadgeFree}>
              {plan === "max" ? tp("max") : plan === "pro" ? tp("pro") : tp("free")}
            </span>
            <span className={styles.duration}>
              {totalMin}:{remSec.toString().padStart(2, "0")} total
            </span>
          </div>
          <textarea
            className={styles.descInput}
            value={props.description}
            onChange={(e) => props.onDescriptionChange(e.target.value)}
            placeholder={te("notesPlaceholder")}
            rows={2}
          />
          {/* Tags */}
          <div className={styles.tagEditor}>
            {props.tags.map((tag) => (
              <span key={tag} className={styles.tagChip}>
                {tag}
                <button
                  type="button"
                  className={styles.tagRemove}
                  onClick={() => props.onTagsChange(props.tags.filter((t) => t !== tag))}
                  aria-label={`Remove tag ${tag}`}
                >×</button>
              </span>
            ))}
            <input
              className={styles.tagInput}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                  e.preventDefault();
                  const next = tagInput.trim().replace(/,$/, "");
                  if (next && !props.tags.includes(next)) props.onTagsChange([...props.tags, next]);
                  setTagInput("");
                }
                if (e.key === "Backspace" && !tagInput && props.tags.length > 0) {
                  props.onTagsChange(props.tags.slice(0, -1));
                }
              }}
              placeholder={props.tags.length === 0 ? te("tagsPlaceholder") : ""}
            />
          </div>

          {/* Action buttons */}
          <div className={styles.actionRow}>
            {isPro ? (
              <>
                <button type="button" className={styles.shareBtn} onClick={handleShare}>
                  {copied ? te("linkCopied") : te("shareWithStudents")}
                </button>
                <button
                  type="button"
                  className={styles.shareBtn}
                  onClick={() => setPublishOpen(true)}
                >
                  {te("publishToMarketplace")}
                </button>
                <button
                  type="button"
                  className={styles.previewBtn}
                  onClick={() => setPreviewOpen(true)}
                >
                  {te("previewAllMoves")}
                </button>
                {isMax && (
                  <button
                    type="button"
                    className={styles.rehearsalBtn}
                    onClick={() => setRehearsalOpen(true)}
                  >
                    {te("rehearsalMode")}
                  </button>
                )}
                <button
                  type="button"
                  className={styles.rehearsalBtn}
                  onClick={() => setFormationPlaybackOpen(true)}
                  disabled={props.dancers.length === 0}
                >
                  {te("playFormation")}
                </button>
              </>
            ) : (
              <a href="/dashboard/upgrade" className={styles.previewLocked}>
                {te("previewLocked")}
              </a>
            )}
          </div>
        </div>

        {/* Move sequence */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{te("sequence")}</h2>
            <div className={styles.sectionLine} />
            <span className={styles.duration}>{props.moves.length} moves</span>
          </div>
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
                plan={plan}
              />
            ))}
          </div>
          <button type="button" className={styles.addBtn} onClick={props.onAddMove}>
            {te("addMove")}
          </button>
        </div>

        {/* Music */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{te("music")}</h2>
            <div className={styles.sectionLine} />
          </div>
          <MusicEditor
            music={props.music}
            onUpdate={props.onUpdateMusic}
            onClear={props.onClearMusic}
          />
        </div>

        {/* Formations — Pro/Max or locked teaser for Free */}
        {isPro ? (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{te("formations")}</h2>
              <div className={styles.sectionLine} />
              <span className={styles.duration}>{props.dancers.length} {props.dancers.length !== 1 ? te("dancers") : te("dancer")}</span>
            </div>
            <FormationEditor
              moves={props.moves}
              dancers={props.dancers}
              onDancersChange={props.onDancersChange}
              getFormationForMove={props.getFormationForMove}
              onUpdatePosition={props.onUpdatePosition}
            />
          </div>
        ) : (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{te("formations")}</h2>
              <div className={styles.sectionLine} />
            </div>
            <a href="/dashboard/upgrade" className={styles.formationsTeaser}>
              <div className={styles.formationsTeaserStage}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={styles.formationsTeaserDot} style={{ left: `${15 + (i % 3) * 30}%`, top: `${30 + Math.floor(i / 3) * 35}%` }} />
                ))}
              </div>
              <div className={styles.formationsTeaserOverlay}>
                <span className={styles.formationsTeaserIcon}>🔒</span>
                <span className={styles.formationsTeaserText}>{te("formationsLocked")}</span>
                <span className={styles.formationsTeaserCta}>{te("upgradeToProCta")}</span>
              </div>
            </a>
          </div>
        )}

        {/* Save */}
        <div className={styles.saveRow}>
          {props.status === "error" && (
            <span className={styles.saveError}>{te("saveError")}</span>
          )}
          {props.status === "saved" && (
            <span className={styles.saveSuccess}>{te("saved")}</span>
          )}
          <button
            type="button"
            className={styles.saveBtn}
            onClick={props.onSave}
            disabled={props.status === "saving"}
          >
            {props.status === "saving" ? te("saving") : te("saveChanges")}
          </button>
        </div>
      </div>
    </>
  );
}
