function Library({ onOpen, onNew }) {
  const [sort, setSort] = useState("recent");
  const items = [...window.CHOREOGRAPHIES].sort((a, b) => {
    if (sort === "recent") return a.plays < b.plays ? 1 : -1;
    if (sort === "duration") return a.duration - b.duration;
    if (sort === "bpm") return a.music.bpm - b.music.bpm;
    return 0;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Library</h1>
          <p className="page-sub">All choreographies in one place. Filter, duplicate, or tune.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={onNew}><IconPlus size={14} /> New</button>
        </div>
      </div>

      <div className="filters">
        <button className={`chip ${sort === "recent" ? "active" : ""}`} onClick={() => setSort("recent")}>Most played</button>
        <button className={`chip ${sort === "duration" ? "active" : ""}`} onClick={() => setSort("duration")}>Duration</button>
        <button className={`chip ${sort === "bpm" ? "active" : ""}`} onClick={() => setSort("bpm")}>BPM</button>
      </div>

      <div className="library-list">
        <div className="library-head">
          <span>Name</span>
          <span>Style</span>
          <span>Duration</span>
          <span>BPM</span>
          <span>Last used</span>
          <span></span>
        </div>
        {items.map(c => (
          <div key={c.id} className="library-row" onClick={() => onOpen(c.id)}>
            <div className="library-name">
              <div className="library-name-thumb accent"><IconMusic size={14} /></div>
              <div>
                <div>{c.name}</div>
                <div className="library-cell-sub">{c.moves.length} moves · {c.targetAudience}</div>
              </div>
            </div>
            <div>
              <Badge accent>{c.style}</Badge>
              <div className="library-cell-sub" style={{ marginTop: 4 }}>{c.category}</div>
            </div>
            <div className="mono" style={{ fontSize: 13 }}>{c.duration} min</div>
            <div className="mono" style={{ fontSize: 13 }}>{c.music.bpm}</div>
            <div style={{ fontSize: 13, color: "var(--text-2)" }}>
              {c.lastUsed}
              <div className="library-cell-sub">{c.plays} plays</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-icon" onClick={(e) => e.stopPropagation()}><IconDots /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Schedule({ onOpen }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-sub">Plan which choreography runs on which day.</p>
        </div>
      </div>
      <div className="cal-row" style={{ marginBottom: 24 }}>
        {window.WEEK.map((d, i) => (
          <div key={i} className={`cal-day ${d.isToday ? "today" : ""} ${d.classes.length ? "has-class" : ""}`}>
            <div className="cal-day-name">{d.day}</div>
            <div className="cal-day-num">{d.num}</div>
            <div className="cal-day-classes">
              {d.classes.length === 0 ? <span style={{ color: "var(--text-4)" }}>Rest</span> : d.classes.join(", ")}
            </div>
          </div>
        ))}
      </div>

      <div className="empty-state" style={{ padding: "40px 20px" }}>
        <div className="empty-icon"><IconCalendar size={22} /></div>
        <div className="empty-title">Drop choreographies onto days</div>
        <div className="empty-sub">Drag from the library to schedule a class.</div>
      </div>
    </div>
  );
}

function Insights() {
  const byCat = {
    Dance: window.CHOREOGRAPHIES.filter(c => c.category === "Dance").length,
    Fitness: window.CHOREOGRAPHIES.filter(c => c.category === "Fitness").length,
  };
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Insights</h1>
          <p className="page-sub">What your students are responding to.</p>
        </div>
      </div>
      <div className="stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <StatCard label="Dance sets" value={byCat.Dance} trend="48% of library" wave={77} />
        <StatCard label="Fitness sets" value={byCat.Fitness} trend="52% of library" wave={88} />
        <StatCard label="Avg plays/week" value="14" trend="+3 vs. last week" wave={99} up />
      </div>
      <div className="empty-state" style={{ marginTop: 24 }}>
        <div className="empty-icon"><IconTrend size={22} /></div>
        <div className="empty-title">Attendance analytics coming soon</div>
        <div className="empty-sub">Connect your booking system to see which sets draw the biggest crowds.</div>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Studio, account, and AI preferences.</p>
        </div>
      </div>
      <div className="form-card">
        <div className="form-section">
          <label className="field-label">Studio name</label>
          <input className="text-input" defaultValue="Pulse Dance Studio" />
          <label className="field-label" style={{ marginTop: 18 }}>Instructor handle</label>
          <input className="text-input" defaultValue="@elena.moves" />
        </div>
        <div className="form-section">
          <label className="field-label">Default class length</label>
          <div className="style-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {window.DURATIONS.map(d => (
              <button key={d} className={`style-opt ${d === 45 ? "selected" : ""}`} style={{ textAlign: "center" }}>{d} min</button>
            ))}
          </div>
        </div>
        <div className="form-foot">
          <div className="form-foot-note">Changes apply to new choreographies only.</div>
          <button className="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Library, Schedule, Insights, Settings });
