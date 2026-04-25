import Link from "next/link";
import styles from "./MarketplaceSection.module.css";

const PACKS = [
  {
    title: "Zumba Hits 2025",
    creator: "Maria L.",
    style: "Zumba",
    moves: 12,
    duration: 60,
    rating: 4.9,
    reviews: 47,
    price: 9,
    color: "#e85d5d",
  },
  {
    title: "Hip Hop Foundations",
    creator: "James R.",
    style: "Hip Hop",
    moves: 10,
    duration: 45,
    rating: 4.7,
    reviews: 31,
    price: 0,
    color: "#5d9be8",
  },
  {
    title: "Bachata Flow",
    creator: "Ana S.",
    style: "Bachata",
    moves: 14,
    duration: 55,
    rating: 5.0,
    reviews: 23,
    price: 12,
    color: "#f5a9b8",
  },
] as const;

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {"★".repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? "½" : ""}
    </span>
  );
}

export function MarketplaceSection() {
  return (
    <section id="marketplace" className={styles.section}>
      <div className={styles.eyebrow}>Marketplace</div>
      <h2 className={styles.title}>
        Buy routines. Sell yours.
      </h2>
      <p className={styles.sub}>
        Browse hundreds of ready-made choreographies from top instructors —
        or publish your own and earn every time someone buys it.
      </p>

      <div className={styles.packGrid}>
        {PACKS.map((p) => (
          <div key={p.title} className={styles.packCard}>
            <div className={styles.packCover} style={{ background: `linear-gradient(135deg, ${p.color}22 0%, #0d0d0d 100%)` }}>
              <span className={styles.packStyleBadge} style={{ color: p.color, borderColor: `${p.color}44`, background: `${p.color}18` }}>
                {p.style}
              </span>
              <div className={styles.packTitle}>{p.title}</div>
              <div className={styles.packCreator}>by {p.creator}</div>
            </div>
            <div className={styles.packBody}>
              <div className={styles.packMeta}>
                <span className={styles.packStat}>{p.moves} moves</span>
                <span className={styles.packDot} />
                <span className={styles.packStat}>{p.duration} min</span>
              </div>
              <div className={styles.packRatingRow}>
                <Stars rating={p.rating} />
                <span className={styles.ratingNum}>{p.rating.toFixed(1)}</span>
                <span className={styles.ratingCount}>({p.reviews})</span>
              </div>
              <div className={styles.packFooter}>
                <span className={styles.packPrice}>
                  {p.price === 0 ? "Free" : `€${p.price}`}
                </span>
                <span className={styles.packCta}>
                  {p.price === 0 ? "Add to library →" : "Buy →"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.ctaRow}>
        <Link href="/marketplace" className={styles.btnPrimary}>
          Browse marketplace →
        </Link>
        <div className={styles.sellerPitch}>
          <span className={styles.sellerIcon}>💰</span>
          <span className={styles.sellerText}>
            Instructors earn up to <strong>€140/month</strong> selling routines they already teach
          </span>
        </div>
      </div>
    </section>
  );
}
