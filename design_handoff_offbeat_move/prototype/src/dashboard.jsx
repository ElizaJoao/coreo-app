function Dashboard({ onOpen, onNew, onNavigate }) {
  const [filter, setFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");

  const items = window.CHOREOGRAPHIES.filter(c => {
    if (catFilter !== "All" && c.category !== catFilter) return false;
    if (filter !== "All" && c.difficulty !== filter) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Today's <span className="accent-word">tempo</span>
          </h1>
          <p className="page-sub">
            6 classes this week, 4 hours 15 minutes scheduled. Your students are waiting for the beat.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm">
            <IconGrid size={14} /> View
          </button>
          <button className="btn btn-primary" onClick={onNew}>
            <IconSpark size={14} /> Generate new
          </button>
        </div>
      </div>

      <div className="stats">
        <StatCard label="Choreographies" value={window.STATS.totalChoreos} trend="+2 this week" wave={11} />
        <StatCard label="Total minutes" value={window.STATS.totalMinutes} trend="Across all plans" wave={22} />
        <StatCard label="Average tempo" value={`${window.STATS.avgBPM}`} suffix="BPM" trend="Moderate-to-fast" wave={33} />
        <StatCard label="Classes this week" value={window.STATS.classesThisWeek} trend="3 left to teach" wave={44} up />
      </div>

      <SectionHeader title="This week" action="View full schedule" onAction={() => onNavigate("calendar")} />
      <div className="cal-row">
        {window.WEEK.map((d, i) => (
          <div key={i} className={`cal-day ${d.isToday ? "today" : ""} ${d.classes.length ? "has-class" : ""}`}>
            <div className="cal-day-name">{d.day}</div>
            <div className="cal-day-num">{d.num}</div>
            <div className="cal-day-classes">
              {d.classes.length === 0 ? <span style={{ color: "var(--text-4)" }}>Rest</span> :
                <>
                  {d.classes.map((_, j) => <span key={j} className="cal-day-dot" />)}
                  {d.classes.length} class{d.classes.length > 1 ? "es" : ""}
                </>
              }
            </div>
          </div>
        ))}
      </div>

      <SectionHeader title="Your choreographies" right={
        <div className="filters" style={{ marginBottom: 0 }}>
          <button className={`chip ${catFilter === "All" ? "active" : ""}`} onClick={() => setCatFilter("All")}>All</button>
          <button className={`chip ${catFilter === "Dance" ? "active" : ""}`} onClick={() => setCatFilter("Dance")}>Dance</button>
          <button className={`chip ${catFilter === "Fitness" ? "active" : ""}`} onClick={() => setCatFilter("Fitness")}>Fitness</button>
          <div className="filter-divider" />
          {["All", ...window.DIFFICULTIES].map(d => (
            <button key={d} className={`chip ${filter === d ? "active" : ""}`} onClick={() => setFilter(d)}>{d}</button>
          ))}
        </div>
      } />

      <div className="card-grid">
        {items.map(c => <ChoreoCard key={c.id} c={c} onOpen={() => onOpen(c.id)} />)}
        <CreateCard onClick={onNew} />
      </div>
    </div>
  );
}

function SectionHeader({ title, right, action, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "28px 0 14px 0", gap: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em", margin: 0, color: "var(--text)" }}>{title}</h2>
      {right}
      {action && (
        <button className="btn btn-ghost btn-sm" onClick={onAction} style={{ marginLeft: "auto" }}>{action}</button>
      )}
    </div>
  );
}

function StatCard({ label, value, suffix, trend, wave, up }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}{suffix && <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 500, marginLeft: 4 }}>{suffix}</span>}
      </div>
      <div className="stat-trend">
        {up && <span className="up">↑ </span>}{trend}
      </div>
      <StatWave seed={wave} />
    </div>
  );
}

function ChoreoCard({ c, onOpen }) {
  return (
    <div className="choreo-card" onClick={onOpen}>
      <div className="choreo-card-header">
        <div style={{ minWidth: 0 }}>
          <div className="choreo-card-style">{c.style} · {c.category}</div>
          <div className="choreo-card-name">{c.name}</div>
        </div>
        <BpmPill bpm={c.music.bpm} />
      </div>
      <MiniWaveform seed={c.music.bpm} count={32} />
      <div className="choreo-card-meta">
        <Badge>{c.duration} min</Badge>
        <Badge>{c.difficulty}</Badge>
        <Badge>{c.moves.length} moves</Badge>
      </div>
      <div className="choreo-card-footer">
        <span>Used {c.lastUsed}</span>
        <span className="mono">{c.plays} plays</span>
      </div>
    </div>
  );
}

function CreateCard({ onClick }) {
  return (
    <div className="choreo-card" onClick={onClick} style={{ borderStyle: "dashed", background: "transparent", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ margin: "auto 0" }}>
        <div className="empty-icon" style={{ margin: "0 auto 12px" }}><IconSpark size={22} /></div>
        <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>Generate a choreography</div>
        <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 4, maxWidth: 220 }}>
          Pick a style, BPM, and audience — AI builds the sequence.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
