"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ChoreographyMove, ChoreographyMusic } from "../types/choreography";
import styles from "./PublishPackModal.module.css";

const COVER_COLORS = [
  "#F5C842",
  "#F59342",
  "#E84A5F",
  "#A855F7",
  "#3B82F6",
  "#10B981",
];

export type PublishPackModalProps = {
  choreographyId: string;
  initialTitle: string;
  style: string;
  difficulty: string;
  duration: number;
  targetAudience: string;
  moves: ChoreographyMove[];
  music?: ChoreographyMusic;
  onClose: () => void;
  onPublished: (packId: string) => void;
};

export function PublishPackModal({
  initialTitle,
  style,
  difficulty,
  duration,
  targetAudience,
  moves,
  music,
  onClose,
  onPublished,
}: PublishPackModalProps) {
  const t = useTranslations("publish");
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState("");
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [priceCents, setPriceCents] = useState(0);
  const [previewIndices, setPreviewIndices] = useState<Set<number>>(new Set([0, 1, 2].filter((i) => i < moves.length)));
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  function togglePreview(i: number) {
    setPreviewIndices((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        if (next.size > 1) next.delete(i);
      } else {
        if (next.size < 3) next.add(i);
      }
      return next;
    });
  }

  async function handlePublish() {
    if (!title.trim()) { setError(t("error")); return; }
    if (!description.trim()) { setError(t("error")); return; }
    setPublishing(true);
    setError("");

    const previewMoves = moves.filter((_, i) => previewIndices.has(i));

    try {
      const res = await fetch("/api/marketplace/packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          style,
          difficulty,
          duration,
          targetAudience,
          priceCents,
          coverColor,
          moves,
          music,
          previewMoves,
        }),
      });
      const data = await res.json() as { id?: string; error?: string };
      if (!res.ok) { setError(data.error ?? t("error")); return; }
      onPublished(data.id!);
    } catch {
      setError(t("error"));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{t("title")}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.body}>
          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label}>{t("packTitle")}</label>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder={t("packTitlePlaceholder")}
            />
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label}>{t("description")}</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={t("descriptionPlaceholder")}
            />
          </div>

          {/* Cover color */}
          <div className={styles.field}>
            <label className={styles.label}>{t("coverColor")}</label>
            <div className={styles.colorRow}>
              {COVER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colorSwatch} ${coverColor === c ? styles.colorSwatchActive : ""}`}
                  style={{ background: c }}
                  onClick={() => setCoverColor(c)}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Price */}
          <div className={styles.field}>
            <label className={styles.label}>{t("price")}</label>
            <div className={styles.priceRow}>
              <button
                type="button"
                className={`${styles.priceOption} ${priceCents === 0 ? styles.priceOptionActive : ""}`}
                onClick={() => setPriceCents(0)}
              >
                {t("free")}
              </button>
              {[499, 999, 1499, 1999, 2999].map((cents) => (
                <button
                  key={cents}
                  type="button"
                  className={`${styles.priceOption} ${priceCents === cents ? styles.priceOptionActive : ""}`}
                  onClick={() => setPriceCents(cents)}
                >
                  €{(cents / 100).toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Preview moves */}
          <div className={styles.field}>
            <label className={styles.label}>{t("previewMoves")}</label>
            <div className={styles.moveList}>
              {moves.map((move, i) => (
                <button
                  key={move.id}
                  type="button"
                  className={`${styles.moveOption} ${previewIndices.has(i) ? styles.moveOptionActive : ""}`}
                  onClick={() => togglePreview(i)}
                >
                  <span className={styles.moveNum}>{i + 1}</span>
                  <span className={styles.moveName}>{move.name}</span>
                  {previewIndices.has(i) && <span className={styles.moveCheck}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>{t("cancel")}</button>
          <button type="button" className={styles.publishBtn} onClick={handlePublish} disabled={publishing}>
            {publishing ? t("publishing") : t("title")}
          </button>
        </div>
      </div>
    </div>
  );
}
