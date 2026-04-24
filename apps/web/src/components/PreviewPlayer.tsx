"use client";

import { useRef, useEffect, useState } from "react";
import type { ChoreographyMove, ChoreographyMusic } from "../types/choreography";
import type { Plan } from "../constants/plans";
import { usePreviewPlayer, PREVIEW_SPEEDS } from "../hooks/usePreviewPlayer";
import { StickFigureCanvas } from "./StickFigureCanvas";
import styles from "./PreviewPlayer.module.css";

type Props = {
  moves: ChoreographyMove[];
  music?: ChoreographyMusic;
  plan: Plan;
  onClose: () => void;
};

function scheduleClick(ctx: AudioContext, time: number, accent: boolean) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = accent ? 1200 : 880;
  gain.gain.setValueAtTime(accent ? 0.35 : 0.18, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  osc.start(time);
  osc.stop(time + 0.04);
}

function createMetronome(bpm: number) {
  const ctx = new AudioContext();
  let nextBeat = ctx.currentTime + 0.05;
  let beat = 0;
  let rafId = 0;
  function tick() {
    while (nextBeat < ctx.currentTime + 0.15) {
      scheduleClick(ctx, nextBeat, beat % 4 === 0);
      nextBeat += 60 / bpm;
      beat++;
    }
    rafId = requestAnimationFrame(tick);
  }
  tick();
  return { ctx, stop: () => { cancelAnimationFrame(rafId); ctx.close(); } };
}

export function PreviewPlayer({ moves, music, plan, onClose }: Props) {
  const isMax = plan === "max";
  const [metronomeOn, setMetronomeOn] = useState(false);
  const metronomeRef = useRef<{ ctx: AudioContext; stop: () => void } | null>(null);

  const player = usePreviewPlayer(moves, onClose);
  const { current, currentIndex, isLast, secondsLeft, paused, speed, videoIds, progress } = player;

  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;

  const musicQuery = music
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${music.artist} ${music.title}`)}`
    : null;

  // Build YouTube iframe src for current move
  const currentVideoId = current ? videoIds[current.id] : undefined;
  let iframeSrc: string | null = null;
  if (current?.videoQuery) {
    if (currentVideoId) {
      iframeSrc = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0`;
    } else if (currentVideoId === undefined) {
      iframeSrc = null; // still loading
    } else {
      // null = resolution failed, fall back to search embed
      iframeSrc = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(current.videoQuery)}&autoplay=0`;
    }
  }

  // Metronome
  useEffect(() => {
    if (metronomeOn && !paused && music?.bpm) {
      metronomeRef.current = createMetronome(music.bpm * speed);
    } else {
      metronomeRef.current?.stop();
      metronomeRef.current = null;
    }
    return () => { metronomeRef.current?.stop(); metronomeRef.current = null; };
  }, [metronomeOn, paused, speed, music?.bpm]);

  useEffect(() => () => { metronomeRef.current?.stop(); }, []);

  return (
    <div className={styles.overlay}>
      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Top bar */}
      <div className={styles.topBar}>
        <span className={styles.moveCounter}>{currentIndex + 1} / {moves.length}</span>
        <span className={styles.moveName}>{current?.name}</span>
        <button type="button" className={styles.closeTopBtn} onClick={onClose}>✕</button>
      </div>

      {/* Main content: left panel + right video */}
      <div className={styles.mainContent}>
        {/* Left panel */}
        <div className={styles.leftPanel}>
          <p className={styles.description}>{current?.description}</p>

          {isMax && current?.verbalCue && (
            <div className={styles.verbalCue}>
              <span className={styles.verbalCueIcon}>🎙</span>
              <p className={styles.verbalCueText}>{current.verbalCue}</p>
            </div>
          )}

          <div className={styles.timerBox}>
            <span className={styles.timerLabel}>Time left</span>
            <span className={styles.timerValue}>{min}:{sec.toString().padStart(2, "0")}</span>
          </div>

          {moves.length > 1 && (
            <div className={styles.moveNav}>
              {moves.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  className={i === currentIndex ? styles.moveNavDotActive : styles.moveNavDot}
                  onClick={() => player.goTo(i)}
                  title={m.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right video panel */}
        <div className={styles.rightPanel}>
          {current?.videoQuery ? (
            iframeSrc ? (
              <iframe
                key={current.id}
                className={styles.videoFrame}
                src={iframeSrc}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`Demo: ${current.name}`}
              />
            ) : (
              <div className={styles.videoLoading}>
                <span>Finding video…</span>
              </div>
            )
          ) : (
            <StickFigureCanvas
              key={current?.id}
              moveName={current?.name ?? ""}
              bpm={music?.bpm}
              className={styles.stickFigure}
            />
          )}
        </div>
      </div>

      {/* Music bar */}
      {music && (
        <div className={styles.musicBar}>
          <span className={styles.musicNote}>♪</span>
          <span className={styles.musicText}>{music.artist} — {music.title}</span>
          {music.bpm && <span className={styles.bpmPill}>{music.bpm} BPM</span>}
          <button
            type="button"
            className={metronomeOn ? styles.metronomeBtnOn : styles.metronomeBtn}
            onClick={() => setMetronomeOn((v) => !v)}
            title="Toggle BPM click track"
          >
            {metronomeOn ? "🔔 Beat on" : "🔕 Beat off"}
          </button>
          {musicQuery && (
            <a href={musicQuery} target="_blank" rel="noopener noreferrer" className={styles.youtubeLink}>
              ▶ Open on YouTube
            </a>
          )}
        </div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.speedGroup}>
          {PREVIEW_SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              className={speed === s ? styles.speedBtnActive : styles.speedBtn}
              onClick={() => player.setSpeed(s)}
            >
              {s}×
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        <button type="button" className={styles.controlBtn} onClick={player.goPrev} disabled={currentIndex === 0}>
          ← Prev
        </button>
        <button type="button" className={styles.pauseBtn} onClick={() => player.setPaused((p) => !p)}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
        <button type="button" className={styles.controlBtn} onClick={player.goNext}>
          {isLast ? "Finish" : "Next →"}
        </button>

        <div className={styles.divider} />
        <button type="button" className={styles.closeBtn} onClick={onClose}>✕ Exit</button>
      </div>
    </div>
  );
}
