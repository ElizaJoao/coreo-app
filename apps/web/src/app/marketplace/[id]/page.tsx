import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "../../../auth";
import { getPackById, getPackRatings, getMyPurchasedPackIds } from "../../../lib/marketplace-service";
import { ImportPackButton } from "../../../components/ImportPackButton";
import styles from "./page.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function PackDetailPage({ params }: Props) {
  const t = await getTranslations("marketplace");
  const tp = await getTranslations("plans");
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const [pack, ratings] = await Promise.all([
    getPackById(id, userId),
    getPackRatings(id),
  ]);

  if (!pack || pack.status !== "published") notFound();

  const isFree = pack.priceCents === 0;
  const isOwn = userId === pack.userId;
  const purchasedIds = userId ? await getMyPurchasedPackIds(userId) : [];
  const hasPurchased = isOwn || isFree || purchasedIds.includes(id);
  const displayMoves = hasPurchased ? pack.moves : pack.previewMoves;
  const lockedCount = hasPurchased ? 0 : Math.max(0, (pack.moves.length || 8) - pack.previewMoves.length);

  const avgRating = pack.ratingCount > 0 ? (pack.ratingSum / pack.ratingCount).toFixed(1) : null;

  return (
    <main className={styles.page}>
      <div className={styles.back}>
        <Link href="/marketplace" className={styles.backLink}>{t("backTo")}</Link>
      </div>

      {/* Header */}
      <div className={styles.header} style={{ borderLeftColor: pack.coverColor }}>
        <div className={styles.headerMeta}>
          <div className={styles.badges}>
            <span className={styles.badge}>{pack.style}</span>
            <span className={styles.badge}>{pack.difficulty}</span>
            <span className={styles.badge}>{pack.duration} min</span>
          </div>
          <h1 className={styles.title}>{pack.title}</h1>
          {pack.creatorName && (
            <Link href={`/marketplace/creator/${pack.userId}`} className={styles.creatorLink}>
              by {pack.creatorName}
            </Link>
          )}
          {pack.description && <p className={styles.description}>{pack.description}</p>}
        </div>

        <div className={styles.purchaseBox}>
          <div className={styles.priceDisplay}>
            {isFree ? <span className={styles.priceFree}>{tp("free")}</span> : <span className={styles.pricePaid}>€{(pack.priceCents / 100).toFixed(2)}</span>}
          </div>
          {avgRating && (
            <div className={styles.ratingDisplay}>★ {avgRating} <span className={styles.ratingCount}>({pack.ratingCount})</span></div>
          )}
          {pack.purchaseCount > 0 && (
            <div className={styles.salesDisplay}>{pack.purchaseCount} {pack.purchaseCount !== 1 ? t("instructors", { count: pack.purchaseCount }) : t("instructor", { count: 1 })} {t("useThis")}</div>
          )}
          {!hasPurchased && !isOwn && (
            <form action={`/api/marketplace/packs/${id}/purchase`} method="POST">
              <button type="submit" className={styles.buyBtn}>
                {isFree ? t("unlockAll") : `€${(pack.priceCents / 100).toFixed(2)}`}
              </button>
            </form>
          )}
          {hasPurchased && !isOwn && userId && (
            <>
              <div className={styles.ownedBadge}>{t("inLibrary")}</div>
              <ImportPackButton packId={id} />
            </>
          )}
          {isOwn && (
            <div className={styles.ownedBadge}>{t("yourPack")}</div>
          )}
        </div>
      </div>

      {/* Music */}
      {pack.music && (
        <div className={styles.musicCard}>
          <span className={styles.musicIcon}>♪</span>
          <div>
            <div className={styles.musicTitle}>{pack.music.title}</div>
            <div className={styles.musicArtist}>{pack.music.artist} · {pack.music.bpm} BPM</div>
          </div>
        </div>
      )}

      {/* Moves */}
      <div className={styles.movesSection}>
        <h2 className={styles.sectionTitle}>
          {hasPurchased ? t("moves") : t("movesPreview")} ({displayMoves.length}{!hasPurchased && lockedCount > 0 ? ` of ${displayMoves.length + lockedCount}` : ""})
        </h2>
        <ol className={styles.moveList}>
          {displayMoves.map((move, i) => (
            <li key={move.id} className={styles.moveItem}>
              <div className={styles.moveHeader}>
                <span className={styles.moveNum}>{i + 1}</span>
                <span className={styles.moveName}>{move.name}</span>
                <span className={styles.moveDuration}>{move.duration}s</span>
              </div>
              {move.description && <p className={styles.moveDesc}>{move.description}</p>}
            </li>
          ))}
        </ol>

        {!hasPurchased && lockedCount > 0 && (
          <div className={styles.lockedOverlay}>
            <div className={styles.lockedIcon}>🔒</div>
            <div className={styles.lockedText}>
              {isFree ? t("unlockAll") : t("unlockMore", { count: lockedCount })}
            </div>
            {!userId && (
              <Link href="/auth/signin" className={styles.lockedCta}>{t("signIn")}</Link>
            )}
          </div>
        )}
      </div>

      {/* Ratings */}
      {ratings.length > 0 && (
        <div className={styles.ratingsSection}>
          <h2 className={styles.sectionTitle}>{t("reviews", { count: ratings.length })}</h2>
          <div className={styles.ratingsList}>
            {ratings.map((r) => (
              <div key={r.id} className={styles.ratingItem}>
                <div className={styles.ratingHeader}>
                  <span className={styles.ratingStars}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className={styles.ratingReviewer}>{r.reviewerName ?? "Anonymous"}</span>
                </div>
                {r.review && <p className={styles.ratingReview}>{r.review}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Creator */}
      {pack.creatorName && (
        <div className={styles.creatorCard}>
          <div className={styles.creatorTitle}>{t("aboutCreator")}</div>
          <Link href={`/marketplace/creator/${pack.userId}`} className={styles.creatorCardLink}>
            {pack.creatorName} →
          </Link>
        </div>
      )}
    </main>
  );
}
