"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ROUTES } from "../../../constants/routes";
import { useChoreographyEditor } from "../../../hooks/useChoreographyEditor";
import { useChoreographyPlayback } from "../../../hooks/useChoreographyPlayback";
import { Spinner } from "../../../components/Spinner";
import type { Choreography, Dancer, DancerPosition, MusicTrack } from "../../../types/choreography";
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
const TRACK_COLORS = ["#e85d5d","#5d9be8","#5de87a","#e8c45d","#c45de8","#5de8d4"];

type Props = { choreography: Choreography; plan: Plan };

export function TimelineEditor({ choreography, plan }: Props) {
  const editor = useChoreographyEditor(choreography);
  const pb = useChoreographyPlayback(editor.moves);
  const [suggestionDone, setSuggestionDone] = useState(false);
  const [dragging, setDragging] = useState<{ dancerId: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // ── Multi-track audio ──────────────────────────────────────────────────────
  const [mainPreviewUrl, setMainPreviewUrl] = useState<string | null>(null);
  // Map trackId → { audio, previewUrl }
  const trackAudios = useRef<Map<string, HTMLAudioElement>>(new Map());
  const lastPlayingTrackId = useRef<string | null>(null);

  // Lookup iTunes preview for the primary music
  useEffect(() => {
    const m = editor.music;
    if (!m?.title || !m?.artist) return;
    let cancelled = false;
    const q = encodeURIComponent(`${m.title} ${m.artist}`);
    fetch(`https://itunes.apple.com/search?term=${q}&media=music&entity=song&limit=3`)
      .then(r => r.json())
      .then((d: { results: Array<{ previewUrl?: string }> }) => {
        if (!cancelled) setMainPreviewUrl(d.results?.[0]?.previewUrl ?? null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [editor.music?.title, editor.music?.artist]);

  // Derive active track: check named tracks first, fall back to main
  const musicTracks = editor.music?.tracks ?? [];
  const activeNamedTrack = musicTracks.find(t => pb.elapsed >= t.startSec && pb.elapsed < t.endSec);
  const activeTrackId = activeNamedTrack ? activeNamedTrack.id : "main";
  const activePreviewUrl = activeNamedTrack?.previewUrl ?? mainPreviewUrl;

  // Switch audio when active track changes
  useEffect(() => {
    if (activeTrackId === lastPlayingTrackId.current) return;
    // Pause the previous track
    if (lastPlayingTrackId.current) {
      trackAudios.current.get(lastPlayingTrackId.current)?.pause();
    }
    lastPlayingTrackId.current = activeTrackId;

    if (!pb.playing || !activePreviewUrl) return;
    let audio = trackAudios.current.get(activeTrackId);
    if (!audio) {
      audio = new Audio(activePreviewUrl);
      trackAudios.current.set(activeTrackId, audio);
    }
    audio.play().catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrackId]);

  // Play/pause all when playing state changes
  useEffect(() => {
    const audio = trackAudios.current.get(lastPlayingTrackId.current ?? "main");
    if (!audio && !activePreviewUrl) return;
    if (pb.playing) {
      const a = audio ?? (() => {
        if (!activePreviewUrl) return null;
        const newAudio = new Audio(activePreviewUrl);
        trackAudios.current.set(activeTrackId, newAudio);
        lastPlayingTrackId.current = activeTrackId;
        return newAudio;
      })();
      a?.play().catch(() => {});
    } else {
      trackAudios.current.forEach(a => a.pause());
    }
  }, [pb.playing]);

  // Cleanup on unmount
  useEffect(() => () => { trackAudios.current.forEach(a => a.pause()); }, []);

  // ── Add Track state ────────────────────────────────────────────────────────
  const [addingTrack, setAddingTrack] = useState(false);
  const [trackQuery, setTrackQuery] = useState("");
  const [trackResults, setTrackResults] = useState<Array<{ trackId: number; trackName: string; artistName: string; previewUrl?: string; artworkUrl60?: string }>>([]);
  const [trackSearching, setTrackSearching] = useState(false);
  const [trackStartSec, setTrackStartSec] = useState(0);
  const trackSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleTrackQueryChange(q: string) {
    setTrackQuery(q);
    if (trackSearchTimer.current) clearTimeout(trackSearchTimer.current);
    if (!q.trim()) { setTrackResults([]); return; }
    trackSearchTimer.current = setTimeout(async () => {
      setTrackSearching(true);
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=5`);
        const data = await res.json() as { results: typeof trackResults };
        setTrackResults(data.results ?? []);
      } catch { setTrackResults([]); }
      finally { setTrackSearching(false); }
    }, 500);
  }

  function addTrack(result: typeof trackResults[0]) {
    const id = `track-${Date.now()}`;
    const endSec = Math.min(trackStartSec + 30, pb.totalSec);
    const newTrack: MusicTrack = {
      id,
      title: result.trackName,
      artist: result.artistName,
      bpm: bpm,
      startSec: trackStartSec,
      endSec,
      previewUrl: result.previewUrl,
      color: TRACK_COLORS[musicTracks.length % TRACK_COLORS.length],
    };
    editor.updateMusic({ tracks: [...musicTracks, newTrack] });
    setAddingTrack(false);
    setTrackQuery("");
    setTrackResults([]);
    // Pre-load audio for the new track
    if (result.previewUrl) {
      trackAudios.current.set(id, new Audio(result.previewUrl));
    }
  }

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

  function getSvgFraction(e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: 0.5, y: 0.5 };
    const rect = svg.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  }

  function handleSvgMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!dragging || !activeMove) return;
    const { x, y } = getSvgFraction(e);
    editor.updateDancerPosition(activeMove.id, dragging.dancerId, { x, y });
  }

  function handleSvgMouseUp() {
    setDragging(null);
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
          <svg
            ref={svgRef}
            viewBox={`0 0 ${stageW} ${stageH}`}
            className={`${styles.stageSvg} ${dragging ? styles.stageDragging : ""}`}
            aria-label="Stage"
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseUp}
          >
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
                <g key={i} style={{ transform: `translate(${stageW * xf}px, ${stageH * 0.58}px)` }}>
                  <StageFigure color="#505050" />
                </g>
              ))
            ) : (
              editor.dancers.map((dancer, i) => {
                const pos = formation[dancer.id];
                const dx = pos ? pos.x * stageW : (stageW / (editor.dancers.length + 1)) * (i + 1);
                const dy = pos ? pos.y * stageH : stageH * 0.58;
                const isDragging = dragging?.dancerId === dancer.id;
                return (
                  <g
                    key={dancer.id}
                    style={{
                      transform: `translate(${dx}px, ${dy}px)`,
                      transition: isDragging ? "none" : "transform 0.75s ease",
                      cursor: "grab",
                    }}
                    onMouseDown={(e) => { e.preventDefault(); setDragging({ dancerId: dancer.id }); }}
                  >
                    <StageFigure color={dancer.color} />
                    <circle cx="0" cy="-80" r="14" fill={dancer.color} opacity="0.9" />
                    <text x="0" y="-76" textAnchor="middle" fontSize="9" fontWeight="700" fill="white" fontFamily="sans-serif">
                      {dancer.name[0]}
                    </text>
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
                  <input
                    className={styles.dancerNameInput}
                    value={d.name}
                    onChange={(e) => editor.setDancers(
                      editor.dancers.map((x) => x.id === d.id ? { ...x, name: e.target.value } : x)
                    )}
                  />
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

        {/* Music multi-track row */}
        <div className={`${styles.tlRow} ${styles.tlRowMusic}`}>
          <div className={styles.tlLabel}>MUSIC</div>
          <div className={styles.musicTrackWrap}>
            {/* Waveform background (seekable) */}
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
            {/* Track blocks overlaid */}
            {musicTracks.map((track) => {
              const left = pb.totalSec > 0 ? (track.startSec / pb.totalSec) * 100 : 0;
              const width = pb.totalSec > 0 ? ((track.endSec - track.startSec) / pb.totalSec) * 100 : 2;
              const color = track.color ?? "#e8c45d";
              const isActive = activeNamedTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`${styles.trackBlock} ${isActive ? styles.trackBlockActive : ""}`}
                  style={{ left: `${left}%`, width: `${Math.max(width, 1)}%`, borderColor: color, background: `${color}22` }}
                  title={`${track.title} — ${track.artist} · ${track.startSec}s–${track.endSec}s · click to remove`}
                  onClick={(e) => { e.stopPropagation(); editor.updateMusic({ tracks: musicTracks.filter(t => t.id !== track.id) }); }}
                >
                  <span className={styles.trackBlockLabel} style={{ color }}>
                    {track.title}
                  </span>
                </div>
              );
            })}
            {/* Add track button */}
            <button
              type="button"
              className={styles.addTrackBtn}
              onClick={() => { setTrackStartSec(Math.floor(pb.elapsed)); setAddingTrack(true); }}
              title="Add music track at current position"
            >
              + Track
            </button>
          </div>
        </div>

        {/* Add Track panel */}
        {addingTrack && (
          <div className={styles.addTrackPanel}>
            <div className={styles.addTrackHead}>
              <span className={styles.addTrackTitle}>Add track starting at {fmtSec(trackStartSec)}</span>
              <button type="button" className={styles.addTrackClose} onClick={() => setAddingTrack(false)}>×</button>
            </div>
            <div className={styles.addTrackBody}>
              <div className={styles.addTrackSearch}>
                <input
                  className={styles.addTrackInput}
                  value={trackQuery}
                  onChange={(e) => handleTrackQueryChange(e.target.value)}
                  placeholder='Search by song or artist — e.g. "Dua Lipa"'
                  autoFocus
                />
                {trackSearching && <span className={styles.addTrackSpinner}>…</span>}
              </div>
              <div className={styles.addTrackDurRow}>
                <span className={styles.addTrackDurLabel}>Start:</span>
                <input
                  type="number"
                  className={styles.addTrackSecInput}
                  value={trackStartSec}
                  min={0}
                  max={pb.totalSec}
                  onChange={(e) => setTrackStartSec(Math.max(0, Number(e.target.value)))}
                />
                <span className={styles.addTrackDurLabel}>s</span>
              </div>
              {trackResults.length > 0 && (
                <div className={styles.addTrackResults}>
                  {trackResults.map((r) => (
                    <button
                      key={r.trackId}
                      type="button"
                      className={styles.addTrackResult}
                      onClick={() => addTrack(r)}
                    >
                      {r.artworkUrl60 && <img src={r.artworkUrl60} alt="" className={styles.addTrackArt} />}
                      <div className={styles.addTrackInfo}>
                        <div className={styles.addTrackName}>{r.trackName}</div>
                        <div className={styles.addTrackArtist}>{r.artistName}</div>
                      </div>
                      {r.previewUrl && <span className={styles.addTrackPreviewBadge}>30s preview</span>}
                    </button>
                  ))}
                </div>
              )}
              {trackQuery && !trackSearching && trackResults.length === 0 && (
                <div className={styles.addTrackEmpty}>No results — try another search</div>
              )}
            </div>
          </div>
        )}

        {/* Moves clips row */}
        <div className={`${styles.tlRow} ${styles.tlRowMoves}`}>
          <div className={styles.tlLabel}>MOVES</div>
          <div className={styles.movesTrack}>
            {editor.moves.map((move, i) => {
              const w = (move.duration / totalDur) * 100;
              const isActive = i === pb.activeMoveIndex;
              return (
                <div
                  key={move.id}
                  className={`${styles.moveClip} ${isActive ? styles.moveClipActive : ""}`}
                  style={{ width: `${w}%` }}
                >
                  <button type="button" className={styles.clipSeekArea} onClick={() => pb.seekToMove(i)}>
                    <span className={styles.clipOrd}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.clipName}>{move.name}</span>
                  </button>
                  <div className={styles.clipControls}>
                    <input
                      type="number"
                      className={styles.clipDurInput}
                      value={move.duration}
                      min={1}
                      max={600}
                      onChange={(e) => editor.updateMove(move.id, { duration: Math.max(1, Number(e.target.value)) })}
                      onClick={(e) => e.stopPropagation()}
                      title="Duration in seconds"
                    />
                    <span className={styles.clipDurUnit}>s</span>
                    <button
                      type="button"
                      className={styles.clipDelete}
                      onClick={(e) => { e.stopPropagation(); editor.deleteMove(move.id); }}
                      title="Delete move"
                    >
                      ×
                    </button>
                  </div>
                </div>
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
