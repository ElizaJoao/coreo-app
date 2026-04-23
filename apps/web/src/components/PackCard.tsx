import Link from "next/link";
import type { Pack } from "../lib/marketplace-service";
import styles from "./PackCard.module.css";

export type PackCardProps = {
  pack: Pack;
};

function StarRating({ count, sum }: { count: number; sum: number }) {
  if (count === 0) return <span className={styles.ratingEmpty}>No ratings yet</span>;
  const avg = sum / count;
  const full = Math.floor(avg);
  const half = avg - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className={styles.rating}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(empty)}
      <span className={styles.ratingNum}>{avg.toFixed(1)} ({count})</span>
    </span>
  );
}

export function PackCard({ pack }: PackCardProps) {
  const isFree = pack.priceCents === 0;
  const priceLabel = isFree ? "Free" : `€${(pack.priceCents / 100).toFixed(2)}`;

  return (
    <Link href={`/marketplace/${pack.id}`} className={styles.card}>
      <div className={styles.cover} style={{ background: `linear-gradient(135deg, ${pack.coverColor}33, ${pack.coverColor}88)`, borderBottom: `2px solid ${pack.coverColor}44` }}>
        <span className={styles.styleBadge}>{pack.style}</span>
        <span className={styles.priceBadge} style={{ background: isFree ? "var(--surface-3)" : pack.coverColor, color: isFree ? "var(--text-3)" : "#000" }}>
          {priceLabel}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.title}>{pack.title}</div>
        {pack.creatorName && (
          <div className={styles.creator}>by {pack.creatorName}</div>
        )}
        <div className={styles.meta}>
          <span>{pack.duration} min</span>
          <span>·</span>
          <span>{pack.difficulty}</span>
          <span>·</span>
          <span>{pack.moves.length || pack.previewMoves.length + 1} moves</span>
        </div>
        <StarRating count={pack.ratingCount} sum={pack.ratingSum} />
        {pack.purchaseCount > 0 && (
          <div className={styles.sales}>{pack.purchaseCount} instructor{pack.purchaseCount !== 1 ? "s" : ""} use this</div>
        )}
      </div>
    </Link>
  );
}
