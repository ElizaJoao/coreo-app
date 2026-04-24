import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getChoreographyPublic, incrementPlays } from "../../../lib/choreography-service";
import styles from "./page.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function SharePage({ params }: Props) {
  const t = await getTranslations("share");
  const { id } = await params;
  const choreography = await getChoreographyPublic(id);
  if (!choreography) notFound();

  // Fire-and-forget — don't block render
  void incrementPlays(id);

  const totalSec = choreography.moves.reduce((s, m) => s + m.duration, 0);
  const totalMin = Math.floor(totalSec / 60);
  const remSec = totalSec % 60;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <img src="/logo-mark.svg" alt="Offbeat" className={styles.logo} />
        <div>
          <h1 className={styles.title}>{choreography.name}</h1>
          <div className={styles.meta}>
            <span>{choreography.style}</span>
            <span>·</span>
            <span>{choreography.difficulty}</span>
            <span>·</span>
            <span>{totalMin}:{remSec.toString().padStart(2, "0")} total</span>
          </div>
        </div>
      </header>

      {choreography.description && (
        <p className={styles.description}>{choreography.description}</p>
      )}

      {choreography.music && (
        <div className={styles.musicCard}>
          <span className={styles.musicIcon}>♪</span>
          <div>
            <div className={styles.musicTitle}>{choreography.music.title}</div>
            <div className={styles.musicArtist}>{choreography.music.artist} · {choreography.music.bpm} BPM</div>
          </div>
        </div>
      )}

      <ol className={styles.moveList}>
        {choreography.moves.map((move) => (
          <li key={move.id} className={styles.moveItem}>
            <div className={styles.moveHeader}>
              <span className={styles.moveName}>{move.name}</span>
              <span className={styles.moveDuration}>{move.duration}s</span>
            </div>
            {move.description && (
              <p className={styles.moveDesc}>{move.description}</p>
            )}
            {move.videoQuery && (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(move.videoQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.videoLink}
              >
                🎬 Watch demo
              </a>
            )}
          </li>
        ))}
      </ol>

      <div className={styles.ctaBanner}>
        <div className={styles.ctaText}>
          <div className={styles.ctaTitle}>{t("madeWith")}</div>
          <div className={styles.ctaSub}>{t("subtitle")}</div>
        </div>
        <a href="/" className={styles.ctaBtn}>{t("tryFree")}</a>
      </div>
    </main>
  );
}
