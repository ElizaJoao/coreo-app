function Sidebar({ route, onNavigate, user }) {
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: IconHome },
    { id: "new", label: "New choreography", icon: IconSpark, highlight: true },
    { id: "library", label: "Library", icon: IconLibrary, count: window.CHOREOGRAPHIES.length },
    { id: "calendar", label: "Schedule", icon: IconCalendar },
    { id: "insights", label: "Insights", icon: IconTrend },
  ];
  const secondary = [
    { id: "settings", label: "Settings", icon: IconSettings },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">O</div>
        <div>
          <div className="brand-name">Offbeat</div>
          <div className="brand-sub">MOVE · STUDIO</div>
        </div>
      </div>

      <div className="nav-group-label">Workspace</div>
      {nav.map(item => {
        const I = item.icon;
        const active = route === item.id;
        return (
          <div
            key={item.id}
            className={`nav-item ${active ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <I />
            <span>{item.label}</span>
            {item.count != null && <span className="count">{item.count}</span>}
          </div>
        );
      })}

      <div className="nav-group-label">Account</div>
      {secondary.map(item => {
        const I = item.icon;
        const active = route === item.id;
        return (
          <div key={item.id} className={`nav-item ${active ? "active" : ""}`} onClick={() => onNavigate(item.id)}>
            <I />
            <span>{item.label}</span>
          </div>
        );
      })}

      <div className="user-pill">
        <div className="user-avatar">{user.initials}</div>
        <div className="user-meta">
          <div className="user-name">{user.name}</div>
          <div className="user-email">{user.email}</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ crumbs, onSearch, onNew }) {
  return (
    <div className="topbar">
      <div className="topbar-title">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="topbar-crumb-sep">/</span>}
            <span className={i === crumbs.length - 1 ? "" : "topbar-crumb"}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-search">
        <IconSearch />
        <input placeholder="Search choreographies, moves, songs…" />
        <span className="topbar-shortcut">⌘K</span>
      </div>
      <div className="topbar-actions">
        <button className="btn btn-primary btn-sm" onClick={onNew}>
          <IconPlus size={14} /> New
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar });
