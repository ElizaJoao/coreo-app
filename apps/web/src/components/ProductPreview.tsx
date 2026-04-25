import styles from "./ProductPreview.module.css";

const DANCERS = [
  { name: "Alex", color: "#e85d5d", x: 22, y: 42 },
  { name: "Sam",  color: "#5d9be8", x: 45, y: 30 },
  { name: "Jordan", color: "#5de87a", x: 65, y: 48 },
  { name: "Morgan", color: "#e8c45d", x: 80, y: 35 },
];

const MOVES = [
  { name: "Warm-up",   w: 10 },
  { name: "Hip Roll",  w: 14 },
  { name: "Grapevine", w: 12, active: true },
  { name: "Cha-cha",   w: 11 },
  { name: "Mambo",     w: 13 },
  { name: "Cool-down", w: 10 },
];

export function ProductPreview() {
  return (
    <div className={styles.outer}>
      {/* Subtle glow behind the frame */}
      <div className={styles.glow} />

      <div className={styles.frame}>
        {/* Browser chrome */}
        <div className={styles.chrome}>
          <div className={styles.dots}>
            <span className={styles.dot} style={{ background: "#ff5f57" }} />
            <span className={styles.dot} style={{ background: "#febc2e" }} />
            <span className={styles.dot} style={{ background: "#28c840" }} />
          </div>
          <div className={styles.urlBar}>offbeat.app / Summer Zumba Mix</div>
        </div>

        {/* App UI */}
        <div className={styles.ui}>
          {/* View tab bar */}
          <div className={styles.tabBar}>
            <span className={styles.tabActive}>Edit</span>
            <span className={styles.tab}>Classic</span>
            <span className={styles.tab}>Cinematic</span>
            <span className={styles.tab}>Rehearsal</span>
          </div>

          {/* Main body: stage + sidebar */}
          <div className={styles.body}>
            {/* Stage */}
            <div className={styles.stage}>
              <div className={styles.stageFloor} />
              {DANCERS.map((d) => (
                <div
                  key={d.name}
                  className={styles.dancer}
                  style={{ left: `${d.x}%`, top: `${d.y}%`, background: d.color }}
                >
                  {d.name[0]}
                </div>
              ))}
              <div className={styles.stageLabel}>GRAPEVINE — Move 3 of 6</div>
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.sideSection}>
                <div className={styles.sideLabel}>DANCERS</div>
                {DANCERS.map((d) => (
                  <div key={d.name} className={styles.sideRow}>
                    <span className={styles.avatar} style={{ background: d.color }}>{d.name[0]}</span>
                    <span className={styles.avatarName}>{d.name}</span>
                  </div>
                ))}
              </div>
              <div className={styles.sideSection}>
                <div className={styles.sideLabel}>TRACK</div>
                <div className={styles.trackCard}>
                  <span className={styles.trackNote}>♪</span>
                  <div>
                    <div className={styles.trackTitle}>Sugarcane (Remix)</div>
                    <div className={styles.trackSub}>Camilo · 128 BPM</div>
                  </div>
                </div>
                <div className={styles.miniWave}>
                  {Array.from({ length: 36 }, (_, i) => {
                    const h = 0.2 + ((i * 37 + 13) % 100) / 100 * 0.8;
                    return (
                      <div
                        key={i}
                        className={i < 18 ? styles.barPlayed : styles.bar}
                        style={{ height: `${h * 100}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>

          {/* Timeline footer */}
          <div className={styles.timeline}>
            <div className={styles.transport}>
              <div className={styles.playBtn}>▶</div>
              <span className={styles.timeCode}>2:14 / 4:30</span>
              <span className={styles.bpmBadge}>128 BPM</span>
            </div>

            {/* Music row */}
            <div className={styles.tlRow}>
              <span className={styles.tlLabel}>MUSIC</span>
              <div className={styles.waveWrap}>
                {Array.from({ length: 64 }, (_, i) => {
                  const h = 0.15 + ((i * 43 + 7) % 100) / 100 * 0.85;
                  return (
                    <div
                      key={i}
                      className={i < 32 ? styles.barPlayed : styles.bar}
                      style={{ height: `${h * 100}%` }}
                    />
                  );
                })}
                <div className={styles.trackBlock} style={{ left: "12%", width: "38%", borderColor: "#e8c45d" }}>
                  Sugarcane
                </div>
                <div className={styles.playhead} style={{ left: "50%" }} />
              </div>
            </div>

            {/* Moves row */}
            <div className={styles.tlRow}>
              <span className={styles.tlLabel}>MOVES</span>
              <div className={styles.movesWrap}>
                {MOVES.map((m) => (
                  <div
                    key={m.name}
                    className={m.active ? styles.clipActive : styles.clip}
                    style={{ width: `${m.w}%` }}
                  >
                    <span className={styles.clipName}>{m.name}</span>
                  </div>
                ))}
                <div className={styles.playhead} style={{ left: "50%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade so it blends into the next section */}
      <div className={styles.bottomFade} />
    </div>
  );
}
