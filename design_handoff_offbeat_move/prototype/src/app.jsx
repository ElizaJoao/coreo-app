const { useState: useS, useEffect: useE } = React;

const USER = { name: "Elena Marques", email: "elena@pulse.studio", initials: "EM" };

function App() {
  const [route, setRoute] = useS(() => localStorage.getItem("offbeat.route") || "dashboard");
  const [currentId, setCurrentId] = useS(() => localStorage.getItem("offbeat.id") || null);
  const [tweaksOpen, setTweaksOpen] = useS(false);
  const [tweaks, setTweaks] = useS(() => ({
    ...window.__TWEAK_DEFAULTS,
    ...(JSON.parse(localStorage.getItem("offbeat.tweaks") || "null") || {}),
  }));

  useE(() => { localStorage.setItem("offbeat.route", route); }, [route]);
  useE(() => { if (currentId) localStorage.setItem("offbeat.id", currentId); }, [currentId]);
  useE(() => { localStorage.setItem("offbeat.tweaks", JSON.stringify(tweaks)); }, [tweaks]);

  // Apply tweaks to :root
  useE(() => {
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.dataset.density = tweaks.density;
    document.documentElement.style.setProperty("--accent-h", tweaks.accentHue);
  }, [tweaks]);

  // Edit-mode protocol
  useE(() => {
    const onMessage = (e) => {
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "__activate_edit_mode") setTweaksOpen(true);
      if (d.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const updateTweaks = (patch) => {
    setTweaks(t => ({ ...t, ...patch }));
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: patch }, "*");
  };

  const go = (r) => { setRoute(r); };
  const open = (id) => { setCurrentId(id); setRoute("detail"); };
  const newSet = () => setRoute("new");
  const back = () => setRoute("dashboard");

  let body, crumbs = ["Dashboard"];
  if (route === "dashboard") { body = <Dashboard onOpen={open} onNew={newSet} onNavigate={go} />; crumbs = ["Dashboard"]; }
  else if (route === "detail") {
    const c = window.CHOREOGRAPHIES.find(x => x.id === currentId) || window.CHOREOGRAPHIES[0];
    body = <Detail id={c.id} onBack={back} />;
    crumbs = ["Dashboard", c.name];
  }
  else if (route === "new") { body = <NewFlow onCancel={back} onCreate={() => setRoute("dashboard")} />; crumbs = ["Dashboard", "New choreography"]; }
  else if (route === "library") { body = <Library onOpen={open} onNew={newSet} />; crumbs = ["Library"]; }
  else if (route === "calendar") { body = <Schedule onOpen={open} />; crumbs = ["Schedule"]; }
  else if (route === "insights") { body = <Insights />; crumbs = ["Insights"]; }
  else if (route === "settings") { body = <Settings />; crumbs = ["Settings"]; }
  else body = <Dashboard onOpen={open} onNew={newSet} onNavigate={go} />;

  const sidebarRoute = route === "detail" ? "library" : route;

  return (
    <div className="app">
      <Sidebar route={sidebarRoute} onNavigate={go} user={USER} />
      <div className="workspace">
        <Topbar crumbs={crumbs} onNew={newSet} />
        {body}
      </div>
      {tweaksOpen && <Tweaks values={tweaks} onChange={updateTweaks} onClose={() => setTweaksOpen(false)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
