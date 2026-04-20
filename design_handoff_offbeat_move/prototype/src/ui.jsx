// Shared UI helpers

const { useState, useEffect, useRef, useMemo, useCallback } = React;

function fmtSec(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function Waveform({ bars, progress = 0, height = 60, barWidth = 3, gap = 2 }) {
  return (
    <div className="waveform" style={{ height: `${height}px` }}>
      {bars.map((b, i) => {
        const played = (i / bars.length) < progress;
        const atCursor = Math.abs((i / bars.length) - progress) < 0.01;
        return (
          <div
            key={i}
            className={`bar ${atCursor ? "cursor" : played ? "played" : ""}`}
            style={{ height: `${b * 100}%` }}
          />
        );
      })}
    </div>
  );
}

function MiniWaveform({ seed = 1, count = 28 }) {
  const bars = useMemo(() => window.makeWaveform(seed, count), [seed, count]);
  return (
    <div className="mini-wave">
      {bars.map((b, i) => (
        <div key={i} className="bar" style={{ height: `${Math.max(15, b * 100)}%` }} />
      ))}
    </div>
  );
}

function BpmPill({ bpm, beating = false }) {
  const dur = 60 / bpm;
  return (
    <span className="bpm-pill">
      <span className="bpm-pulse" style={{ animationDuration: beating ? `${dur}s` : "0s", animationPlayState: beating ? "running" : "paused" }} />
      {bpm} BPM
    </span>
  );
}

function Badge({ children, accent = false, style }) {
  return <span className={`badge ${accent ? "badge-accent" : ""}`} style={style}>{children}</span>;
}

function StatWave({ seed, bars = 12 }) {
  const ws = useMemo(() => window.makeWaveform(seed, bars), [seed, bars]);
  return (
    <div className="stat-wave">
      {ws.map((b, i) => <div key={i} className="bar" style={{ height: `${b * 100}%`, opacity: 0.4 + b * 0.5 }} />)}
    </div>
  );
}

Object.assign(window, { fmtSec, Waveform, MiniWaveform, BpmPill, Badge, StatWave });
