import { notFound } from "next/navigation";
import Link from "next/link";
import { getCreatorProfile } from "../../../../lib/marketplace-service";
import { PackCard } from "../../../../components/PackCard";
import styles from "./page.module.css";

type Props = { params: Promise<{ userId: string }> };

export default async function CreatorProfilePage({ params }: Props) {
  const { userId } = await params;
  const profile = await getCreatorProfile(userId);
  if (!profile) notFound();

  const avgRating = profile.avgRating > 0 ? profile.avgRating.toFixed(1) : null;

  return (
    <main className={styles.page}>
      <div className={styles.back}>
        <Link href="/marketplace" className={styles.backLink}>← Back to Marketplace</Link>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt={profile.name} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarInitials}>
              {profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
          )}
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.name}>{profile.name}</h1>
          {profile.modalities.length > 0 && (
            <div className={styles.modalities}>
              {profile.modalities.map((m) => (
                <span key={m} className={styles.modalityChip}>{m}</span>
              ))}
            </div>
          )}
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{profile.packs.length}</span>
              <span className={styles.statLabel}>pack{profile.packs.length !== 1 ? "s" : ""}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{profile.totalSales}</span>
              <span className={styles.statLabel}>total sales</span>
            </div>
            {avgRating && (
              <div className={styles.stat}>
                <span className={styles.statValue}>★ {avgRating}</span>
                <span className={styles.statLabel}>avg rating</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {profile.packs.length > 0 ? (
        <>
          <h2 className={styles.sectionTitle}>Published packs ({profile.packs.length})</h2>
          <div className={styles.grid}>
            {profile.packs.map((pack) => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        </>
      ) : (
        <div className={styles.empty}>This creator hasn&apos;t published any packs yet.</div>
      )}
    </main>
  );
}
