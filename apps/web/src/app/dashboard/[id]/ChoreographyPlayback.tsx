"use client";

import { useRef } from "react";
import Link from "next/link";
import { DANCE_STYLES } from "../../../constants/choreography";
import { ROUTES } from "../../../constants/routes";
import { useChoreographyPlayback } from "../../../hooks/useChoreographyPlayback";
import { BpmPill } from "../../../components/BpmPill";
import { Badge } from "../../../components/Badge";
import type { Choreography } from "../../../types/choreography";
import styles from "./ChoreographyPlayback.module.css";

function fmtSec(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2.5l9 5.5-9 5.5V2.5z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="2" width="4" height="12" rx="1" />
      <rect x="9" y="2" width="4" height="12" rx="1" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M9 3l5-1v10M9 3v10M3 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM14 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  );
}

type Props = { choreography: Choreography };

export function ChoreographyPlayback({ choreography }: Props) {
  const { moves, music, name, style, difficulty, duration, targetAudience, description } = choreography;
  const { playing, elapsed, totalSec, activeMoveIndex, progress, toggle, seek, seekToMove } =
    useChoreographyPlayback(moves);

  const progressBarRef = useRef<HTMLDivElement>(null);

  const category = (DANCE_STYLES as readonly string[]).includes(style) ? "Dance" : "Fitness";

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(totalSec * pct);
  }

  // Cue sheet: first 8 moves with cumulative start times
  const cues = moves.slice(0, 8).map((m, i) => {
    let cum = 0;
    for (let j = 0; j < i; j++) cum += moves[j].duration;
    return { time: cum, name: m.name };
  });

  // Waveform bars (seeded from BPM)
  const waveformBars = Array.from({ length: 64 }, (_, i) => {
    const seed = ((music?.bpm ?? 120) * 17 + i * 31) % 100;
    return 0.15 + (seed / 100) * 0.85;
  });

  return (
    <div className={styles.container}>
      <Link href={ROUTES.DASHBOARD} className={styles.backLink}>
        ← Back to dashboard
      </Link>

      <div className={styles.grid}>
        {/* ── Left: Track shell ── */}
        <div className={styles.trackShell}>
          {/* Head */}
          <div className={styles.trackHead}>
            <div className={styles.trackHeadLeft}>
              <div className={styles.trackEyebrow}>{category} · {style}</div>
              <h1 className={styles.trackTitle}>{name}</h1>
              <div className={styles.trackBadges}>
                <Badge>{duration} min</Badge>
                <Badge>{difficulty}</Badge>
                {targetAudience && <Badge>{targetAudience}</Badge>}
              </div>
            </div>
          </div>

          {/* Transport */}
          <div className={styles.transport}>
            <button type="button" className={styles.playBtn} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <IconPause /> : <IconPlay />}
            </button>

            <div className={styles.transportTime}>
              <span className={styles.timeCurrent}>{fmtSec(elapsed)}</span>
              <span className={styles.timeSep}>/</span>
              <span>{fmtSec(totalSec)}</span>
            </div>

            <div
              ref={progressBarRef}
              className={styles.progressBar}
              onClick={handleProgressClick}
              role="slider"
              aria-label="Seek"
              aria-valuenow={elapsed}
              aria-valuemin={0}
              aria-valuemax={totalSec}
            >
              <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
            </div>

            <span className={styles.movePill}>
              Move {activeMoveIndex + 1}/{moves.length}
            </span>

            {music?.bpm && <BpmPill bpm={music.bpm} beating={playing} />}
          </div>

          {/* Moves list */}
          <div className={styles.movesList}>
            {moves.map((m, i) => {
              const isActive = i === activeMoveIndex;
              const isPlayed = i < activeMoveIndex;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.moveRow} ${isActive ? styles.moveRowActive : ""} ${isPlayed ? styles.moveRowPlayed : ""}`}
                  onClick={() => seekToMove(i)}
                >
                  <div className={`${styles.ordChip} ${isActive ? styles.ordChipActive : ""}`}>
                    {String(m.order ?? i + 1).padStart(2, "0")}
                  </div>
                  <div className={styles.moveInfo}>
                    <div className={styles.moveName}>
                      {m.name}
                      {m.tag && <span className={styles.moveTag}>{m.tag}</span>}
                    </div>
                    {m.description && (
                      <div className={styles.moveDesc}>{m.description}</div>
                    )}
                  </div>
                  <div className={`${styles.moveDur} ${isActive ? styles.moveDurActive : ""}`}>
                    {fmtSec(m.duration)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: Side panels ── */}
        <div className={styles.sidePanel}>
          {music && (
            <div className={styles.musicPanel}>
              <div className={styles.musicHead}>
                <div className={styles.musicEyebrow}>
                  <IconMusic /> Suggested soundtrack
                </div>
                <div className={styles.musicTitle}>{music.title}</div>
                <div className={styles.musicArtist}>{music.artist}</div>
              </div>
              <div className={styles.musicMeta}>
                <div className={styles.musicMetaCell}>
                  <div className={styles.musicMetaLabel}>Tempo</div>
                  <div className={styles.musicMetaValue}>{music.bpm}</div>
                </div>
                <div className={styles.musicMetaCell}>
                  <div className={styles.musicMetaLabel}>Time sig</div>
                  <div className={`${styles.musicMetaValue} ${styles.musicMetaValueSm}`}>4/4</div>
                </div>
                <div className={styles.musicMetaCell}>
                  <div className={styles.musicMetaLabel}>Key</div>
                  <div className={`${styles.musicMetaValue} ${styles.musicMetaValueSm}`}>A min</div>
                </div>
              </div>
              {/* Waveform */}
              <div className={styles.waveform}>
                {waveformBars.map((h, i) => {
                  const played = i / waveformBars.length < progress;
                  const atCursor = Math.abs(i / waveformBars.length - progress) < 0.015;
                  return (
                    <div
                      key={i}
                      className={`${styles.waveBar} ${atCursor ? styles.waveBarCursor : played ? styles.waveBarPlayed : ""}`}
                      style={{ height: `${h * 100}%` }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {description && (
            <div className={styles.notesPanel}>
              <h3 className={styles.panelTitle}>Instructor notes</h3>
              <p className={styles.panelBody}>{description}</p>
            </div>
          )}

          <div className={styles.notesPanel}>
            <h3 className={styles.panelTitle}>Cue sheet</h3>
            <div className={styles.cueList}>
              {cues.map((cue, i) => (
                <div key={i} className={styles.cueItem}>
                  <span className={styles.cueTime}>{fmtSec(cue.time)}</span>
                  <span>{cue.name}</span>
                </div>
              ))}
              {moves.length > 8 && (
                <div className={styles.cueItem}>
                  <span className={styles.cueTime}>…</span>
                  <span>+{moves.length - 8} more</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
