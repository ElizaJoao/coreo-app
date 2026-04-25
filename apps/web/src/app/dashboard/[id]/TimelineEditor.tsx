"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "../../../constants/routes";
import { useChoreographyEditor } from "../../../hooks/useChoreographyEditor";
import { useChoreographyPlayback } from "../../../hooks/useChoreographyPlayback";
import { Spinner } from "../../../components/Spinner";
import type { Choreography, Dancer, DancerPosition } from "../../../types/choreography";
import type { Plan } from "../../../constants/plans";
import styles from "./TimelineEditor.module.css";

function fmtSec(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function IconPlay() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5l9 5.5-9 5.5z"/></svg>;
}
function IconPause() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>;
}
function IconPlus() {
  return <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 2v12M2 8h12"/></svg>;
}
function IconSpark() {
  return <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z"/></svg>;
}

// Front-facing 3D humanoid figure for the stage
function StageFigure({ color = "#555" }: { color?: string }) {
  return (
    <>
      <ellipse cx="0" cy="54" rx="19" ry="5" fill="rgba(0,0,0,0.45)" />
      <ellipse cx="0" cy="-65" rx="17" ry="19" fill={color} />
      <rect x="-5" y="-46" width="10" height="11" rx="4" fill={color} opacity="0.8" />
      <rect x="-19" y="-36" width="38" height="46" rx="12" fill={color} opacity="0.85" />
      <rect x="-41" y="-32" width="23" height="11" rx="5" fill={color} opacity="0.75" transform="rotate(-18,-29,-26)" />
      <rect x="18" y="-32" width="23" height="11" rx="5" fill={color} opacity="0.75" transform="rotate(18,29,-26)" />
      <rect x="-57" y="-18" width="20" height="9" rx="4" fill={color} opacity="0.6" transform="rotate(12,-47,-13)" />
      <rect x="37" y="-18" width="20" height="9" rx="4" fill={color} opacity="0.6" transform="rotate(-12,47,-13)" />
      <rect x="-18" y="10" width="14" height="42" rx="7" fill={color} opacity="0.7" transform="rotate(-4,-11,31)" />
      <rect x="4" y="10" width="14" height="42" rx="7" fill={color} opacity="0.7" transform="rotate(4,11,31)" />
    </>
  );
}

const DEFAULT_DANCER_NAMES = ["Alex", "Sam", "Jordan", "Morgan", "Taylor", "Casey", "Riley", "Drew"];
const DEFAULT_DANCER_COLORS = ["#e85d5d","#5d9be8","#5de87a","#e8c45d","#c45de8","#5de8d4","#e8875d","#9b5de8"];

type Props = { choreography: Choreography; plan: Plan };

export function TimelineEditor({ choreography, plan }: Props) {
  const editor = useChoreographyEditor(choreography);
  const pb = useChoreographyPlayback(editor.moves);
  const [suggestionDone, setSuggestionDone] = useState(false);

  const bpm = editor.music?.bpm ?? 120;
  const activeMove = editor.moves[pb.activeMoveIndex];
  const formation = activeMove ? editor.getFormationForMove(activeMove.id) : {};
  const totalDur = editor.moves.reduce((s, m) => s + m.duration, 0) || 1;
  const stageLabel = `STAGE · ${(activeMove?.tag ?? activeMove?.name ?? "—").toUpperCase()}`;

  const waveformBars = Array.from({ length: 120 }, (_, i) => {
    const seed = ((bpm * 13 + i * 19) * 11) % 100;
    return 0.15 + (seed / 100) * 0.85;
  });

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    pb.seek(pb.totalSec * ((e.clientX - rect.left) / rect.width));
  }

  function handleAddDancer() {
    const i = editor.dancers.length % DEFAULT_DANCER_NAMES.length;
    editor.setDancers([
      ...editor.dancers,
      { id: `d-${Date.now()}`, name: DEFAULT_DANCER_NAMES[i], color: DEFAULT_DANCER_COLORS[i] },
    ]);
  }

  const stageW = 640, stageH = 340;

  return (
    <div className={styles.root}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href={ROUTES.DASHBOARD} className={styles.breadcrumb}>← Dashboard</Link>
          <span className={styles.breadSep}>/</span>
          <input
            className={styles.nameInput}
            value={editor.name}
            onChange={(e) => editor.setName(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.metaChip}>{bpm} BPM</span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.metaChip}>{choreography.difficulty}</span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.metaChip}>{choreography.duration} min</span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.metaChip}>{editor.moves.length} moves</span>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.shareBtn}
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/share/${choreography.id}`)}
          >
            Share
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={editor.save}
            disabled={editor.status === "saving"}
          >
            {editor.status === "saving" && <Spinner />}
            {editor.status === "saving" ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      {/* ── Body: stage + side panel ────────────────────────────────────── */}
      <div className={styles.body}>
        {/* Stage */}
        <div className={styles.stageWrap}>
          <div className={styles.stageLabels}>
            <span className={styles.stageCrumb}>{stageLabel}</span>
            {activeMove?.tag && (
              <span className={styles.grooveBadge}>{activeMove.tag.toUpperCase()}</span>
            )}
          </div>
          <svg viewBox={`0 0 ${stageW} ${stageH}`} className={styles.stageSvg} aria-label="Stage">
            <defs>
              <radialGradient id="te-spot" cx="50%" cy="72%" r="52%">
                <stop offset="0%" stopColor="oklch(0.82 0.17 85 / 0.12)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect width={stageW} height={stageH} fill="#090909" />
            <ellipse cx={stageW / 2} cy={stageH * 0.91} rx={stageW * 0.54} ry={stageH * 0.13} fill="#181818" stroke="#252525" strokeWidth="1" />
            <ellipse cx={stageW / 2} cy={stageH * 0.72} rx={stageW * 0.48} ry={stageH * 0.54} fill="url(#te-spot)" />
            {[-2, -1, 0, 1, 2].map((n) => (
              <line key={n}
                x1={stageW / 2 + n * 82} y1={stageH * 0.78}
                x2={stageW / 2 + n * 53} y2={stageH * 0.96}
                stroke="#212121" strokeWidth="1"
              />
            ))}
            {/* Figures */}
            {editor.dancers.length === 0 ? (
              [0.28, 0.5, 0.72].map((xf, i) => (
                <g key={i} transform={`translate(${stageW * xf}, ${stageH * 0.58})`}>
                  <StageFigure color="#505050" />
                </g>
              ))
            ) : (
              editor.dancers.map((dancer, i) => {
                const pos = formation[dancer.id];
                const dx = pos ? pos.x * stageW : (stageW / (editor.dancers.length + 1)) * (i + 1);
                const dy = pos ? pos.y * stageH * 0.7 + stageH * 0.1 : stageH * 0.58;
                return (
                  <g key={dancer.id} transform={`translate(${dx}, ${dy})`}>
                    <StageFigure color={dancer.color} />
                  </g>
                );
              })
            )}
          </svg>
        </div>

        {/* Side panel */}
        <aside className={styles.sidePanel}>
          {/* Dancers */}
          <div className={styles.panelSection}>
            <div className={styles.panelHead}>
              <span className={styles.panelLabel}>DANCERS</span>
              <span className={styles.panelCount}>{editor.dancers.length}</span>
            </div>
            <div className={styles.dancerList}>
              {editor.dancers.map((d) => (
                <div key={d.id} className={styles.dancerRow}>
                  <span className={styles.dancerAvatar} style={{ background: d.color }}>
                    {d.name[0]}
                  </span>
                  <span className={styles.dancerName}>{d.name}</span>
                  <button
                    type="button"
                    className={styles.dancerRemove}
                    onClick={() => editor.setDancers(editor.dancers.filter((x) => x.id !== d.id))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className={styles.addDancerBtn} onClick={handleAddDancer}>
              <IconPlus /> Add
            </button>
          </div>

          {/* Track */}
          {editor.music && (
            <div className={styles.panelSection}>
              <div className={styles.panelHead}>
                <span className={styles.panelLabel}>TRACK</span>
              </div>
              <div className={styles.trackCard}>
                <div className={styles.trackIcon}>♪</div>
                <div className={styles.trackInfo}>
                  <div className={styles.trackTitle}>{editor.music.title}</div>
                  <div className={styles.trackSub}>{editor.music.artist} · {bpm} BPM</div>
                </div>
              </div>
              <div className={styles.miniWave}>
                {Array.from({ length: 40 }, (_, i) => {
                  const seed = ((bpm * 7 + i * 23) * 3) % 100;
                  const h = 0.2 + (seed / 100) * 0.8;
                  const played = i / 40 < pb.progress;
                  return (
                    <div
                      key={i}
                      className={`${styles.miniBar} ${played ? styles.miniBarPlayed : ""}`}
                      style={{ height: `${h * 100}%` }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Claude Suggests */}
          {!suggestionDone && activeMove && (
            <div className={styles.suggestBox}>
              <div className={styles.suggestHead}>
                <IconSpark /> CLAUDE SUGGESTS
              </div>
              <p className={styles.suggestBody}>
                Try a 24s isolation break after '{activeMove.name}' — gives students a breath before the chorus.
              </p>
              <div className={styles.suggestActions}>
                <button type="button" className={styles.insertBtn} onClick={() => setSuggestionDone(true)}>
                  Insert
                </button>
                <button type="button" className={styles.skipBtn} onClick={() => setSuggestionDone(true)}>
                  Skip
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── Timeline ────────────────────────────────────────────────────── */}
      <footer className={styles.timeline}>
        {/* Transport */}
        <div className={styles.transport}>
          <button type="button" className={styles.playBtn} onClick={pb.toggle} aria-label={pb.playing ? "Pause" : "Play"}>
            {pb.playing ? <IconPause /> : <IconPlay />}
          </button>
          <div className={styles.timeDisplay}>
            <span className={styles.timeCur}>{fmtSec(pb.elapsed)}</span>
            <span className={styles.timeSep}>/</span>
            <span>{fmtSec(pb.totalSec)}</span>
          </div>
          <span className={styles.bpmChip}>{bpm} BPM</span>
          <span className={styles.snapChip}>SNAP 1/4 beat</span>
          <span className={styles.zoomChip}>100%</span>
        </div>

        {/* Music waveform row */}
        <div className={styles.tlRow}>
          <div className={styles.tlLabel}>MUSIC</div>
          <div
            className={styles.tlContent}
            onClick={handleProgressClick}
            role="slider"
            aria-label="Seek"
            aria-valuenow={pb.elapsed}
            aria-valuemin={0}
            aria-valuemax={pb.totalSec}
          >
            {waveformBars.map((h, i) => {
              const played = i / waveformBars.length < pb.progress;
              const cursor = Math.abs(i / waveformBars.length - pb.progress) < 0.008;
              return (
                <div
                  key={i}
                  className={`${styles.tlBar} ${cursor ? styles.tlBarCursor : played ? styles.tlBarPlayed : ""}`}
                  style={{ height: `${h * 100}%` }}
                />
              );
            })}
            <div className={styles.tlPlayhead} style={{ left: `${pb.progress * 100}%` }} />
          </div>
        </div>

        {/* Moves clips row */}
        <div className={styles.tlRow}>
          <div className={styles.tlLabel}>MOVES</div>
          <div className={styles.movesTrack}>
            {editor.moves.map((move, i) => {
              const w = (move.duration / totalDur) * 100;
              const isActive = i === pb.activeMoveIndex;
              return (
                <button
                  key={move.id}
                  type="button"
                  className={`${styles.moveClip} ${isActive ? styles.moveClipActive : ""}`}
                  style={{ width: `${w}%` }}
                  onClick={() => pb.seekToMove(i)}
                >
                  <span className={styles.clipOrd}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.clipName}>{move.name}</span>
                  <span className={styles.clipDur}>{fmtSec(move.duration)}</span>
                </button>
              );
            })}
            <button type="button" className={styles.addClipBtn} onClick={editor.addMove}>
              + Add
            </button>
            <div className={styles.movesPlayhead} style={{ left: `${pb.progress * 100}%` }} />
          </div>
        </div>
      </footer>
    </div>
  );
}
