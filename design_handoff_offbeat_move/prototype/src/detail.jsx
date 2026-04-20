function Detail({ id, onBack }) {
  const c = window.CHOREOGRAPHIES.find(x => x.id === id);
  if (!c) return null;

  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0); // in seconds
  const totalSec = c.moves.reduce((s, m) => s + m.duration, 0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (next >= totalSec) { setPlaying(false); return totalSec; }
        return next;
      });
    }, 120); // fast playback for demo
    return () => clearInterval(t);
  }, [playing, totalSec]);

  // Determine active move
  let cumulative = 0;
  let activeMoveIdx = 0;
  for (let i = 0; i < c.moves.length; i++) {
    if (elapsed < cumulative + c.moves[i].duration) { activeMoveIdx = i; break; }
    cumulative += c.moves[i].duration;
    activeMoveIdx = i;
  }
  const progress = elapsed / totalSec;

  return (
    <div className="page">
      <span className="detail-backlink" onClick={onBack}>
        <IconArrowLeft size={14} /> Back to dashboard
      </span>

      <div className="detail-grid">
        <div>
          <div className="track-shell">
            <div className="track-head">
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>
                  {c.category} · {c.style}
                </div>
                <h1 className="track-title">{c.name}</h1>
                <div className="track-style-line">
                  <Badge><IconTimer size={11} /> {c.duration} min</Badge>
                  <Badge><IconZap size={11} /> {c.difficulty}</Badge>
                  <Badge><IconUsers size={11} /> {c.targetAudience}</Badge>
                </div>
              </div>
              <div className="track-head-right">
                <button className="btn-icon" title="Duplicate"><IconCopy /></button>
                <button className="btn-icon" title="More"><IconDots /></button>
              </div>
            </div>

            <div className="transport">
              <div className="play-btn" onClick={() => setPlaying(p => !p)}>
                {playing ? <IconPause /> : <IconPlay />}
              </div>
              <div className="transport-time">
                <span className="cur">{fmtSec(elapsed)}</span>
                <span>/</span>
                <span>{fmtSec(totalSec)}</span>
              </div>
              <div className="transport-bar" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                setElapsed(Math.floor(totalSec * pct));
              }}>
                <div className="transport-bar-fill" style={{ width: `${progress * 100}%` }} />
              </div>
              <span className="transport-pill">Move {activeMoveIdx + 1}/{c.moves.length}</span>
              <BpmPill bpm={c.music.bpm} beating={playing} />
            </div>

            <div className="moves-list">
              {c.moves.map((m, i) => (
                <div key={m.id}
                  className={`move-row ${i === activeMoveIdx ? "is-active" : ""} ${i < activeMoveIdx ? "is-played" : ""}`}
                  onClick={() => {
                    let cum = 0;
                    for (let j = 0; j < i; j++) cum += c.moves[j].duration;
                    setElapsed(cum);
                  }}
                >
                  <div className="move-ord-chip">{String(m.order).padStart(2, "0")}</div>
                  <div className="move-info">
                    <div className="move-name">
                      {m.name}
                      <span className="move-tag">{m.tag}</span>
                    </div>
                    <div className="move-desc">{m.description}</div>
                  </div>
                  <div className="move-dur mono">{fmtSec(m.duration)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-side">
          <div className="music-panel">
            <div className="music-head">
              <div className="music-eyebrow"><IconMusic size={11} /> Suggested soundtrack</div>
              <div className="music-title">{c.music.title}</div>
              <div className="music-artist">{c.music.artist}</div>
            </div>
            <div className="music-meta-grid">
              <div className="music-meta-cell">
                <div className="music-meta-label">Tempo</div>
                <div className="music-meta-value">{c.music.bpm}</div>
              </div>
              <div className="music-meta-cell">
                <div className="music-meta-label">Time sig</div>
                <div className="music-meta-value small">4/4</div>
              </div>
              <div className="music-meta-cell">
                <div className="music-meta-label">Key</div>
                <div className="music-meta-value small">A min</div>
              </div>
            </div>
            <Waveform bars={c.waveform} progress={progress} height={64} />
          </div>

          <div className="notes-panel">
            <h3>Instructor notes</h3>
            <p>{c.description}</p>
          </div>

          <div className="notes-panel">
            <h3>Cue sheet</h3>
            <div className="cue-list">
              {c.moves.slice(0, 5).map((m, i) => {
                let cum = 0;
                for (let j = 0; j < i; j++) cum += c.moves[j].duration;
                return (
                  <div key={m.id} className="cue-item">
                    <span className="cue-time">{fmtSec(cum)}</span>
                    <span>{m.name}</span>
                  </div>
                );
              })}
              {c.moves.length > 5 && (
                <div className="cue-item"><span className="cue-time">…</span><span>+{c.moves.length - 5} more</span></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Detail });
