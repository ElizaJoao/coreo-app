import Link from "next/link";

import { DANCE_STYLES } from "../constants/choreography";
import type { Choreography } from "../types/choreography";
import { Badge } from "./Badge";
import { BpmPill } from "./BpmPill";
import { FavoriteButton } from "./FavoriteButton";
import { MiniWaveform } from "./MiniWaveform";
import styles from "./ChoreographyCard.module.css";

export type ChoreographyCardProps = {
  choreography: Choreography;
  href: string;
};

function getCategory(style: string): string {
  return (DANCE_STYLES as readonly string[]).includes(style) ? "Dance" : "Fitness";
}

export function ChoreographyCard({ choreography, href }: ChoreographyCardProps) {
  const category = getCategory(choreography.style);
  const bpm = choreography.music?.bpm;
  const waveSeed = bpm ?? choreography.moves.length * 17;

  return (
    <div className={styles.card}>
      <FavoriteButton
        choreographyId={choreography.id}
        initialFavorite={choreography.isFavorite}
      />

      <Link href={href} className={styles.cardLink}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <div className={styles.styleLabel}>{choreography.style} · {category}</div>
            <div className={styles.name}>{choreography.name}</div>
          </div>
          {bpm && <BpmPill bpm={bpm} />}
        </div>

        <MiniWaveform seed={waveSeed} count={32} />

        <div className={styles.meta}>
          <Badge>{choreography.duration} min</Badge>
          <Badge>{choreography.difficulty}</Badge>
          <Badge>{choreography.moves.length} moves</Badge>
        </div>

        <div className={styles.footer}>
          <span>{choreography.lastUsed ? `Used ${choreography.lastUsed}` : new Date(choreography.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          {choreography.plays != null && choreography.plays > 0 && (
            <span className={styles.plays}>{choreography.plays} plays</span>
          )}
        </div>
      </Link>

      {choreography.tags.length > 0 && (
        <div className={styles.tagRow}>
          {choreography.tags.map((tag) => (
            <Link
              key={tag}
              href={`/dashboard/library?tag=${encodeURIComponent(tag)}`}
              className={styles.tagChip}
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
