"use client";

import { useRef, useState } from "react";

import { useMusicSearch } from "../hooks/useMusicSearch";
import type { ChoreographyMusic } from "../types/choreography";
import styles from "./MusicEditor.module.css";

export type MusicEditorProps = {
  music?: ChoreographyMusic;
  onUpdate: (patch: Partial<ChoreographyMusic>) => void;
  onClear: () => void;
};

export function MusicEditor({ music, onUpdate, onClear }: MusicEditorProps) {
  const { query, setQuery, results, isSearching } = useMusicSearch();
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentIdRef = useRef<number | null>(null);

  function testBeep() {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  function playPreview(trackId: number, previewUrl: string) {
    console.log("[MusicEditor] playPreview", { trackId, previewUrl, audioEl: audioRef.current });
    const audio = audioRef.current;
    if (!audio) { console.error("[MusicEditor] no audio element"); return; }

    if (currentIdRef.current === trackId && !audio.paused) {
      audio.pause();
      setPlayingId(null);
      currentIdRef.current = null;
      return;
    }

    setAudioError(false);
    audio.src = previewUrl;
    audio.volume = 0.7;
    currentIdRef.current = trackId;
    setPlayingId(trackId);

    audio.play()
      .then(() => console.log("[MusicEditor] play() started, duration:", audio.duration))
      .catch((err) => {
        console.error("[MusicEditor] play failed:", err);
        setAudioError(true);
        setPlayingId(null);
        currentIdRef.current = null;
      });
  }

  function selectTrack(trackName: string, artistName: string) {
    onUpdate({ title: trackName, artist: artistName });
    setQuery("");
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingId(null);
    currentIdRef.current = null;
  }

  const m = music ?? { title: "", artist: "", bpm: 120 };
  const showResults = results.length > 0 && query.trim().length >= 2;

  return (
    <div className={styles.root}>
      {/* Hidden audio element — always in DOM so ref is stable */}
      <audio
        ref={audioRef}
        onCanPlay={() => console.log("[MusicEditor] canplay fired")}
        onEnded={() => { setPlayingId(null); currentIdRef.current = null; }}
        onError={(e) => {
          const el = e.currentTarget;
          console.error("[MusicEditor] audio error", el.error?.code, el.error?.message);
          setAudioError(true); setPlayingId(null); currentIdRef.current = null;
        }}
      />

      {/* Audio test */}
      <button type="button" onClick={testBeep} className={styles.clearBtn} style={{marginBottom: 4}}>
        🔊 Test audio (click for beep)
      </button>

      {/* Search */}
      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>♪</span>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a song…"
          />
          {isSearching && <span className={styles.searchSpinner} />}
        </div>
      </div>

      {audioError && (
        <p className={styles.audioError}>Preview unavailable for this track.</p>
      )}

      {/* Results */}
      {showResults && (
        <ul className={styles.results}>
          {results.map((r) => (
            <li key={r.trackId} className={styles.result}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.artworkUrl} alt="" className={styles.artwork} width={40} height={40} />
              <div className={styles.resultInfo} onClick={() => selectTrack(r.trackName, r.artistName)}>
                <span className={styles.resultName}>{r.trackName}</span>
                <span className={styles.resultArtist}>{r.artistName}</span>
              </div>
              {r.previewUrl && (
                <button
                  type="button"
                  className={`${styles.playBtn} ${playingId === r.trackId ? styles.playing : ""}`}
                  onClick={() => playPreview(r.trackId, r.previewUrl!)}
                  aria-label={playingId === r.trackId ? "Pause" : "Play preview"}
                >
                  {playingId === r.trackId ? "■" : "▶"}
                </button>
              )}
              <button
                type="button"
                className={styles.selectBtn}
                onClick={() => selectTrack(r.trackName, r.artistName)}
              >
                Select
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Manual fields */}
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label}>Song title</label>
          <input
            className={styles.input}
            value={m.title}
            placeholder="e.g. Blinding Lights"
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Artist</label>
          <input
            className={styles.input}
            value={m.artist}
            placeholder="e.g. The Weeknd"
            onChange={(e) => onUpdate({ artist: e.target.value })}
          />
        </div>
        <div className={styles.fieldSmall}>
          <label className={styles.label}>BPM</label>
          <input
            type="number"
            className={styles.input}
            value={m.bpm}
            min={60}
            max={220}
            onChange={(e) => onUpdate({ bpm: Number(e.target.value) })}
          />
        </div>
      </div>

      {music && (
        <button type="button" className={styles.clearBtn} onClick={onClear}>
          Remove music
        </button>
      )}
    </div>
  );
}
