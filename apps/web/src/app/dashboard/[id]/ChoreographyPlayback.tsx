"use client";

import { useRef } from "react";
import Link from "next/link";
import { DANCE_STYLES } from "../../../constants/choreography";
import { ROUTES } from "../../../constants/routes";
import { useChoreographyPlayback } from "../../../hooks/useChoreographyPlayback";
import { BpmPill } from "../../../components/BpmPill";
import { Badge } from "../../../components/Badge";
import type { Choreography, Dancer } from "../../../types/choreography";
import type { DetailView } from "./ChoreographyDetail";
import styles from "./ChoreographyPlayback.module.css";

export type PlaybackMode = Exclude<DetailView, "edit">;

// ── Utilities ──────────────────────────────────────────────────────────────

function fmtSec(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function IconPlay() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5l9 5.5-9 5.5V2.5z"/></svg>;
}
function IconPause() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>;
}
function IconPrev() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h2v12H3zM6 8l7-5v10z"/></svg>;
}
function IconNext() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M13 2h-2v12h2zM10 8L3 3v10z"/></svg>;
}

// ── Shared sub-components ──────────────────────────────────────────────────

// Front-view 3D humanoid (Cinematic)
function StageFigure({ color = "#555", scale = 1 }: { color?: string; scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <ellipse cx="0" cy="56" rx="20" ry="5.5" fill="rgba(0,0,0,0.5)" />
      <ellipse cx="0" cy="-66" rx="18" ry="20" fill={color} />
      <rect x="-5" y="-46" width="10" height="12" rx="4" fill={color} opacity="0.8" />
      <rect x="-20" y="-35" width="40" height="48" rx="13" fill={color} opacity="0.85" />
      <rect x="-43" y="-31" width="24" height="12" rx="6" fill={color} opacity="0.75" transform="rotate(-18,-31,-25)" />
      <rect x="19" y="-31" width="24" height="12" rx="6" fill={color} opacity="0.75" transform="rotate(18,31,-25)" />
      <rect x="-60" y="-16" width="21" height="10" rx="5" fill={color} opacity="0.6" transform="rotate(12,-49,-11)" />
      <rect x="39" y="-16" width="21" height="10" rx="5" fill={color} opacity="0.6" transform="rotate(-12,49,-11)" />
      <rect x="-19" y="13" width="15" height="44" rx="7" fill={color} opacity="0.7" transform="rotate(-4,-11,35)" />
      <rect x="4" y="13" width="15" height="44" rx="7" fill={color} opacity="0.7" transform="rotate(4,11,35)" />
    </g>
  );
}

// Overhead colored dancer blob (Classic + Rehearsal)
function DancerBlob({
  x, y, color, label, r = 22,
}: {
  x: number; y: number; color: string; label: string; r?: number;
}) {
  const gradId = `blob-${label.replace(/\s/g, "")}`;
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="4" rx={r} ry={r * 1.3} fill={`url(#${gradId})`} />
      {/* Highlight */}
      <ellipse cx={-r * 0.3} cy={-r * 0.25} rx={r * 0.35} ry={r * 0.25} fill="white" opacity="0.18" />
      <text x="0" y="6" textAnchor="middle" fontSize={r * 0.55} fontWeight="700" fill="white" opacity="0.9" fontFamily="sans-serif">{label[0]}</text>
    </g>
  );
}

// Waveform bar strip
function WaveStrip({ bpm, progress, count = 100, height = 40 }: { bpm: number; progress: number; count?: number; height?: number }) {
  const bars = Array.from({ length: count }, (_, i) => {
    const seed = ((bpm * 17 + i * 31) * 7) % 100;
    return 0.15 + (seed / 100) * 0.85;
  });
  return (
    <div className={styles.waveStrip} style={{ height }}>
      {bars.map((h, i) => {
        const played = i / bars.length < progress;
        const cursor = Math.abs(i / bars.length - progress) < 0.012;
        return (
          <div
            key={i}
            className={`${styles.waveBar} ${cursor ? styles.waveBarCursor : played ? styles.waveBarPlayed : ""}`}
            style={{ height: `${h * 100}%` }}
          />
        );
      })}
    </div>
  );
}

// ── 01 Cinematic mode ──────────────────────────────────────────────────────

function CinematicView({
  choreography,
  elapsed, totalSec, playing, activeMoveIndex, progress,
  toggle, seek,
}: {
  choreography: Choreography;
  elapsed: number; totalSec: number; playing: boolean;
  activeMoveIndex: number; progress: number;
  toggle: () => void; seek: (s: number) => void;
}) {
  const { moves, music, name, style, dancers = [] } = choreography;
  const activeMove = moves[activeMoveIndex];
  const bpm = music?.bpm ?? 120;
  const category = (DANCE_STYLES as readonly string[]).includes(style) ? "Dance" : "Fitness";

  function handleWaveClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(totalSec * ((e.clientX - rect.left) / rect.width));
  }

  const upNextMove = moves[activeMoveIndex + 1];

  return (
    <div className={styles.cinematic}>
      {/* Top bar */}
      <div className={styles.cinTop}>
        <div className={styles.cinTopLeft}>
          <span className={styles.cinNowPlaying}>NOW PLAYING · {String(activeMoveIndex + 1).padStart(2, "0")}/{String(moves.length).padStart(2, "0")}</span>
          <span className={styles.cinTitle}>{name}</span>
        </div>
        <div className={styles.cinTopRight}>
          {upNextMove && (
            <div className={styles.cinUpNext}>
              <span className={styles.cinUpNextLabel}>UP NEXT</span>
              <span className={styles.cinUpNextName}>{upNextMove.name}</span>
              {upNextMove.duration && <span className={styles.cinUpNextDur}>{fmtSec(upNextMove.duration)}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Stage */}
      <div className={styles.cinStage}>
        <svg viewBox="0 0 800 420" className={styles.cinStageSvg}>
          <defs>
            <radialGradient id="cin-spot" cx="50%" cy="75%" r="55%">
              <stop offset="0%" stopColor="oklch(0.82 0.17 85 / 0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="800" height="420" fill="#080808" />
          <ellipse cx="400" cy="385" rx="340" ry="50" fill="#151515" stroke="#212121" strokeWidth="1" />
          <ellipse cx="400" cy="310" rx="300" ry="230" fill="url(#cin-spot)" />
          {[-2, -1, 0, 1, 2].map((n) => (
            <line key={n} x1={400 + n * 100} y1={330} x2={400 + n * 65} y2={400} stroke="#1e1e1e" strokeWidth="1" />
          ))}
          {/* Default 3 figures or dancer-count figures */}
          {(dancers.length > 0 ? dancers.slice(0, 5) : [null, null, null] as null[]).map((d, i, arr) => {
            const count = arr.length;
            const x = (800 / (count + 1)) * (i + 1);
            return (
              <g key={i} transform={`translate(${x}, 240)`}>
                <StageFigure color={d ? d.color : "#5a5a5a"} scale={1.1} />
              </g>
            );
          })}
        </svg>

        {/* Text overlays */}
        {activeMove && (
          <div className={styles.cinOverlay}>
            <div className={styles.cinMoveMeta}>
              <span className={styles.cinMoveTag}>{style.toUpperCase()} · {activeMove.tag ?? category.toUpperCase()}</span>
            </div>
            <h1 className={styles.cinMoveName}>{activeMove.name}</h1>
            {activeMove.description && (
              <p className={styles.cinMoveDesc}>{activeMove.description}</p>
            )}
            {activeMove.verbalCue && (
              <div className={styles.cinCue}>
                <span className={styles.cinCueIcon}>♪</span>
                "{activeMove.verbalCue}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom transport */}
      <div className={styles.cinBottom}>
        <div className={styles.cinTime}>{fmtSec(elapsed)}</div>

        <div className={styles.cinWaveWrap} onClick={handleWaveClick} role="slider" aria-label="Seek" aria-valuenow={elapsed} aria-valuemin={0} aria-valuemax={totalSec}>
          <WaveStrip bpm={bpm} progress={progress} count={140} height={40} />
        </div>

        <div className={styles.cinTransport}>
          <button type="button" className={styles.cinPlayBtn} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <IconPause /> : <IconPlay />}
          </button>
          {music?.bpm && <BpmPill bpm={music.bpm} beating={playing} />}
        </div>
      </div>
    </div>
  );
}

// ── 02 Classic mode (overhead formation view) ──────────────────────────────

function ClassicView({
  choreography,
  elapsed, totalSec, playing, activeMoveIndex, progress,
  toggle, seek, seekToMove,
}: {
  choreography: Choreography;
  elapsed: number; totalSec: number; playing: boolean;
  activeMoveIndex: number; progress: number;
  toggle: () => void; seek: (s: number) => void; seekToMove: (i: number) => void;
}) {
  const { moves, music, name, dancers = [] } = choreography;
  const activeMove = moves[activeMoveIndex];
  const bpm = music?.bpm ?? 120;

  const moveCumStart = moves.slice(0, activeMoveIndex).reduce((s, m) => s + m.duration, 0);
  const moveElapsed = elapsed - moveCumStart;
  const moveDur = activeMove?.duration ?? 1;

  function handleWaveClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(totalSec * ((e.clientX - rect.left) / rect.width));
  }

  // Spread dancers in a scattered oval formation for overhead view
  const stageW = 560, stageH = 380;
  const defaultPositions = [
    [0.28, 0.35], [0.55, 0.22], [0.72, 0.4],
    [0.18, 0.6], [0.45, 0.72], [0.68, 0.62],
    [0.35, 0.5], [0.6, 0.5],
  ];

  return (
    <div className={styles.classic}>
      {/* Header */}
      <div className={styles.classicHead}>
        <div className={styles.classicHeadLeft}>
          <span className={styles.classicNowPlaying}>NOW PLAYING · MIDNIGHT PULSE</span>
          <span className={styles.classicTitle}>{name}</span>
        </div>
        <button type="button" className={styles.classicFindBtn}>Find It</button>
      </div>

      {/* Main: stage + move list */}
      <div className={styles.classicMain}>
        {/* Stage (overhead) */}
        <div className={styles.classicStageWrap}>
          <div className={styles.classicStageCrumb}>{activeMove?.tag ?? "STAGE"} · {activeMove?.name?.toUpperCase() ?? "—"}</div>
          <svg viewBox={`0 0 ${stageW} ${stageH}`} className={styles.classicStageSvg}>
            <defs>
              <radialGradient id="cls-floor" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#1e1e1e" />
                <stop offset="100%" stopColor="#111" />
              </radialGradient>
            </defs>
            <rect width={stageW} height={stageH} fill="#0d0d0d" />
            <ellipse cx={stageW / 2} cy={stageH / 2} rx={stageW * 0.46} ry={stageH * 0.44} fill="url(#cls-floor)" stroke="#222" strokeWidth="1" />
            {/* Dancer blobs */}
            {(dancers.length > 0 ? dancers : Array.from({ length: 6 }, (_, i) => ({
              id: `ph-${i}`, name: ["Ana", "Bruno", "Clara", "Diego", "Elena", "Faris"][i],
              color: ["#e85d5d", "#5d9be8", "#5de87a", "#e8c45d", "#c45de8", "#5de8d4"][i],
            }))).map((d, i) => {
              const [xf, yf] = defaultPositions[i % defaultPositions.length];
              return (
                <DancerBlob
                  key={d.id}
                  x={stageW * xf}
                  y={stageH * yf}
                  color={d.color}
                  label={d.name}
                  r={22}
                />
              );
            })}
          </svg>
          {/* Below stage */}
          <div className={styles.classicMoveInfo}>
            <div className={styles.classicMoveName}>{activeMove?.name ?? "—"}</div>
            <div className={styles.classicMoveDesc}>{activeMove?.description}</div>
            <div className={styles.classicMoveDur}>{fmtSec(moveDur)}s</div>
          </div>
        </div>

        {/* Move list */}
        <div className={styles.classicMoveList}>
          {moves.map((m, i) => {
            const isActive = i === activeMoveIndex;
            const isPlayed = i < activeMoveIndex;
            return (
              <button
                key={m.id}
                type="button"
                className={`${styles.classicMoveRow} ${isActive ? styles.classicMoveRowActive : ""} ${isPlayed ? styles.classicMoveRowPlayed : ""}`}
                onClick={() => seekToMove(i)}
              >
                <div className={`${styles.classicMoveOrd} ${isActive ? styles.classicMoveOrdActive : ""}`}>
                  {String(m.order ?? i + 1).padStart(2, "0")}
                </div>
                <div className={styles.classicMoveText}>
                  <div className={styles.classicMoveRowName}>{m.name}</div>
                  {m.description && <div className={styles.classicMoveRowDesc}>{m.description}</div>}
                </div>
                <div className={styles.classicMoveDurChip}>{fmtSec(m.duration)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom transport */}
      <div className={styles.classicBottom}>
        <button type="button" className={styles.classicPlayBtn} onClick={toggle}>
          {playing ? <IconPause /> : <IconPlay />}
        </button>
        <div className={styles.classicTimeDisp}>
          <span className={styles.classicTimeCur}>{fmtSec(elapsed)}</span>
          <span className={styles.classicTimeSep}>/</span>
          <span>{fmtSec(totalSec)}</span>
        </div>

        <div className={styles.classicWaveWrap} onClick={handleWaveClick} role="slider" aria-label="Seek" aria-valuenow={elapsed} aria-valuemin={0} aria-valuemax={totalSec}>
          <WaveStrip bpm={bpm} progress={progress} count={100} height={36} />
        </div>

        {music && (
          <div className={styles.classicTrackInfo}>
            <span className={styles.classicTrackName}>{music.title}</span>
            <span className={styles.classicTrackDot}>·</span>
            <span className={styles.classicTrackBpm}>{bpm} BPM</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 03 Rehearsal Ring mode ─────────────────────────────────────────────────

function RehearsalView({
  choreography,
  elapsed, totalSec, playing, activeMoveIndex, progress,
  toggle, seekToMove,
}: {
  choreography: Choreography;
  elapsed: number; totalSec: number; playing: boolean;
  activeMoveIndex: number; progress: number;
  toggle: () => void; seekToMove: (i: number) => void;
}) {
  const { moves, music, name, dancers = [] } = choreography;
  const activeMove = moves[activeMoveIndex];
  const nextMove = moves[activeMoveIndex + 1];
  const bpm = music?.bpm ?? 120;

  // Countdown within the active move
  const moveCumStart = moves.slice(0, activeMoveIndex).reduce((s, m) => s + m.duration, 0);
  const moveDur = activeMove?.duration ?? 30;
  const moveElapsed = elapsed - moveCumStart;
  const countdown = Math.max(0, Math.ceil(moveDur - moveElapsed));
  const moveProgress = Math.min(1, moveElapsed / moveDur);

  // SVG ring
  const R = 130, CX = 160, CY = 160;
  const circ = 2 * Math.PI * R;
  const dash = circ * (1 - moveProgress);

  // Dancer blobs around the ring
  const defaultDancers = Array.from({ length: 6 }, (_, i) => ({
    id: `reh-${i}`,
    name: ["Ana", "Bruno", "Clara", "Diego", "Elena", "Faris"][i],
    color: ["#e85d5d", "#5d9be8", "#5de87a", "#e8c45d", "#c45de8", "#5de8d4"][i],
  }));
  const ringDancers = dancers.length > 0 ? dancers : defaultDancers;
  const ringR = R + 34;

  return (
    <div className={styles.rehearsal}>
      {/* Header */}
      <div className={styles.rehHead}>
        <span className={styles.rehBadge}>REHEARSAL RING</span>
        <span className={styles.rehTitle}>{name}</span>
        <div className={styles.rehBpm}>
          <BpmPill bpm={bpm} beating={playing} />
        </div>
      </div>

      {/* Content */}
      <div className={styles.rehContent}>
        {/* Left: move info */}
        <div className={styles.rehInfo}>
          <div className={styles.rehMoveIndicator}>
            NOW · MOVE {String(activeMoveIndex + 1).padStart(2, "0")}/{String(moves.length).padStart(2, "0")}
          </div>
          <h1 className={styles.rehMoveName}>{activeMove?.name ?? "—"}</h1>
          {activeMove?.description && (
            <p className={styles.rehMoveDesc}>{activeMove.description}</p>
          )}
          {activeMove?.verbalCue && (
            <div className={styles.rehCue}>
              <span className={styles.rehCueIcon}>♪</span>
              "{activeMove.verbalCue}"
            </div>
          )}
          {nextMove && (
            <div className={styles.rehNext}>
              <span className={styles.rehNextLabel}>Next:</span>
              <span className={styles.rehNextName}>{nextMove.name}</span>
              {nextMove.duration && <span className={styles.rehNextDur}>{fmtSec(nextMove.duration)}</span>}
            </div>
          )}

          <div className={styles.rehTransport}>
            <button type="button" className={styles.rehPrevBtn} onClick={() => seekToMove(Math.max(0, activeMoveIndex - 1))}>
              <IconPrev />
            </button>
            <button type="button" className={styles.rehPlayBtn} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <IconPause /> : <IconPlay />}
            </button>
            <button type="button" className={styles.rehNextBtn} onClick={() => seekToMove(Math.min(moves.length - 1, activeMoveIndex + 1))}>
              <IconNext />
            </button>
          </div>
        </div>

        {/* Right: countdown ring */}
        <div className={styles.rehRingWrap}>
          <svg width="320" height="320" viewBox="0 0 320 320" className={styles.rehRingSvg}>
            {/* Ring track */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--surface-3)" strokeWidth="10" />
            {/* Ring progress */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dash}
              transform={`rotate(-90 ${CX} ${CY})`}
              style={{ transition: "stroke-dashoffset 0.9s linear" }}
            />
            {/* Dancer blobs around ring */}
            {ringDancers.map((d, i) => {
              const angle = (i / ringDancers.length) * 2 * Math.PI - Math.PI / 2;
              const bx = CX + ringR * Math.cos(angle);
              const by = CY + ringR * Math.sin(angle);
              return <DancerBlob key={d.id} x={bx} y={by} color={d.color} label={d.name} r={16} />;
            })}
            {/* Countdown */}
            <text x={CX} y={CY + 14} textAnchor="middle" fontSize="58" fontWeight="800" fill="var(--accent)" fontFamily="inherit" letterSpacing="-2">
              {countdown}
            </text>
            <text x={CX} y={CY + 38} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-3)" fontFamily="inherit" letterSpacing="0.1em" style={{ textTransform: "uppercase" }}>
              seconds
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Main ChoreographyPlayback ──────────────────────────────────────────────

type Props = { choreography: Choreography; mode: PlaybackMode };

export function ChoreographyPlayback({ choreography, mode }: Props) {
  const pb = useChoreographyPlayback(choreography.moves);

  const shared = {
    choreography,
    elapsed: pb.elapsed,
    totalSec: pb.totalSec,
    playing: pb.playing,
    activeMoveIndex: pb.activeMoveIndex,
    progress: pb.progress,
    toggle: pb.toggle,
    seek: pb.seek,
    seekToMove: pb.seekToMove,
  };

  if (mode === "cinematic") return <CinematicView {...shared} />;
  if (mode === "classic")   return <ClassicView   {...shared} />;
  return                           <RehearsalView {...shared} />;
}
