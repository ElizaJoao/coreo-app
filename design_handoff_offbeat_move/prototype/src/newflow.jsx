function NewFlow({ onCancel, onCreate }) {
  const [category, setCategory] = useState("Dance");
  const [style, setStyle] = useState("Hip Hop");
  const [durIdx, setDurIdx] = useState(2); // DURATIONS[2] = 45
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [audience, setAudience] = useState("Evening adult class");
  const [description, setDescription] = useState("Build energy gradually to a hook around 60% through. Keep moves knee-friendly.");
  const [bpm, setBpm] = useState(118);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);

  const duration = window.DURATIONS[durIdx];
  const styleList = category === "Dance" ? window.DANCE_STYLES : window.FITNESS_STYLES;

  useEffect(() => {
    if (!generating) return;
    const timers = [
      setTimeout(() => setGenStep(1), 700),
      setTimeout(() => setGenStep(2), 1500),
      setTimeout(() => setGenStep(3), 2400),
      setTimeout(() => { onCreate({ style, duration, difficulty, audience, description, bpm }); }, 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [generating]);

  useEffect(() => {
    if (!styleList.includes(style)) setStyle(styleList[0]);
  }, [category]);

  const isValid = style && audience.trim().length > 0;

  return (
    <div className="page page-narrow">
      <span className="detail-backlink" onClick={onCancel}>
        <IconArrowLeft size={14} /> Cancel
      </span>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">
            Compose a <span className="accent-word">new set</span>
          </h1>
          <p className="page-sub">
            Sketch the shape. Offbeat writes the moves, picks the music, and aligns everything to the beat.
          </p>
        </div>
      </div>

      <div className="form-card">
        <div className="form-section">
          <div className="form-section-head">
            <span className="form-section-label">01 · Discipline</span>
            <span className="form-section-hint">{styleList.length} styles available</span>
          </div>
          <div className="style-tabs">
            <div className={`style-tab ${category === "Dance" ? "active" : ""}`} onClick={() => setCategory("Dance")}>Dance</div>
            <div className={`style-tab ${category === "Fitness" ? "active" : ""}`} onClick={() => setCategory("Fitness")}>Fitness</div>
          </div>
          <div className="style-grid">
            {styleList.map(s => (
              <button key={s} className={`style-opt ${style === s ? "selected" : ""}`} onClick={() => setStyle(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-head">
            <span className="form-section-label">02 · Duration & tempo</span>
            <span className="form-section-hint">Slide to target length</span>
          </div>
          <div className="duration-row">
            <div className="duration-value">{duration}<span className="unit">min</span></div>
            <div style={{ flex: 1 }}>
              <input
                type="range"
                className="range-slider"
                min={0} max={window.DURATIONS.length - 1} step={1}
                value={durIdx}
                onChange={(e) => setDurIdx(Number(e.target.value))}
              />
              <div className="duration-labels">
                {window.DURATIONS.map((d, i) => (
                  <span key={d} className={i === durIdx ? "cur" : ""}>{d}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr auto", gap: 18, alignItems: "center" }}>
            <div>
              <label className="field-label">Target BPM</label>
              <input
                type="range"
                className="range-slider"
                min={60} max={180} step={1}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--text-4)" }}>
                <span>60 · slow</span>
                <span>120 · mid</span>
                <span>180 · hot</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 32, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.02em" }}>
                {bpm}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>BPM</div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-head">
            <span className="form-section-label">03 · Difficulty</span>
          </div>
          <div className="diff-seg">
            {window.DIFFICULTIES.map((d, i) => (
              <button key={d} className={`diff-opt ${difficulty === d ? "selected" : ""}`} onClick={() => setDifficulty(d)}>
                <div className="diff-level">{d}</div>
                <div className="diff-desc">
                  {d === "Beginner" ? "Simple cues, low impact" : d === "Intermediate" ? "Combines + light syncopation" : "Complex patterns, full range"}
                </div>
                <div className="diff-dots">
                  {[0, 1, 2].map(n => <div key={n} className={`diff-dot ${n <= i ? "on" : ""}`} />)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-head">
            <span className="form-section-label">04 · Audience & notes</span>
          </div>
          <label className="field-label">Target audience</label>
          <input className="text-input" value={audience} onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g., Seniors, Beginners, HIIT lovers" />
          <label className="field-label" style={{ marginTop: 18 }}>Instructor notes</label>
          <textarea className="area-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the vibe, goals, and any constraints…" />
        </div>

        <div className="form-foot">
          <div className="form-foot-note">
            <IconSpark size={12} /> Claude will draft 8–14 moves totalling ~{duration} min
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary" disabled={!isValid} onClick={() => { setGenerating(true); setGenStep(0); }}>
              <IconSpark size={14} /> Generate choreography
            </button>
          </div>
        </div>
      </div>

      {generating && <GeneratingOverlay step={genStep} bpm={bpm} style={style} />}
    </div>
  );
}

function GeneratingOverlay({ step, bpm, style }) {
  const steps = [
    "Reading your brief",
    "Structuring the sequence",
    "Matching tempo to audience",
    "Picking a soundtrack",
  ];
  return (
    <div className="generating-overlay">
      <div className="generating-card">
        <div className="gen-waveform">
          {Array.from({ length: 22 }).map((_, i) => (
            <div key={i} className="bar" style={{ animationDelay: `${i * 40}ms` }} />
          ))}
        </div>
        <div className="gen-title">Composing your {style} set</div>
        <div className="gen-sub">Building at {bpm} BPM · drawing from 10k patterns</div>
        <div className="gen-steps">
          {steps.map((s, i) => (
            <div key={i} className={`gen-step ${i < step ? "done" : i === step ? "active" : ""}`}>
              <div className="gen-step-icon">
                {i < step ? <IconCheck size={12} /> : i === step ? <span className="bpm-pulse" style={{ animationDuration: "0.6s", background: "currentColor" }} /> : <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", opacity: 0.3 }} />}
              </div>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NewFlow });
