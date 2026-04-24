"use client";

import { useState } from "react";
import styles from "./FavoriteButton.module.css";

export type FavoriteButtonProps = {
  choreographyId: string;
  initialFavorite: boolean;
};

export function FavoriteButton({ choreographyId, initialFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setIsFavorite((v) => !v);
    setLoading(true);
    try {
      const res = await fetch(`/api/choreography/${choreographyId}/favorite`, { method: "PATCH" });
      if (!res.ok) setIsFavorite((v) => !v); // revert on error
    } catch {
      setIsFavorite((v) => !v);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={`${styles.btn} ${isFavorite ? styles.active : ""}`}
      onClick={toggle}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      disabled={loading}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
