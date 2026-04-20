function Tweaks({ values, onChange, onClose }) {
  const { theme, accentHue, density } = values;
  return (
    <div className="tweaks">
      <div className="tweaks-head">
        <div className="tweaks-title"><IconSliders size={12} /> Tweaks</div>
        <button className="tweaks-close" onClick={onClose}><IconX size={14} /></button>
      </div>

      <div className="tweak-row">
        <div className="tweak-label"><span>Theme</span></div>
        <div className="tweak-segment">
          {[
            { k: "dark", label: "Dark" },
            { k: "light", label: "Light" },
          ].map(o => (
            <button key={o.k} className={theme === o.k ? "active" : ""} onClick={() => onChange({ theme: o.k })}>{o.label}</button>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <div className="tweak-label"><span>Accent hue</span><span className="val">{accentHue}°</span></div>
        <input type="range" className="range-slider" min={0} max={360} step={1}
          value={accentHue} onChange={(e) => onChange({ accentHue: Number(e.target.value) })} />
        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
          {[85, 30, 200, 300, 155].map(h => (
            <button key={h} onClick={() => onChange({ accentHue: h })}
              style={{
                width: 22, height: 22, borderRadius: 6,
                background: `oklch(0.82 0.17 ${h})`,
                border: accentHue === h ? "2px solid var(--text)" : "1px solid var(--border)",
              }} />
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <div className="tweak-label"><span>Density</span></div>
        <div className="tweak-segment">
          {[
            { k: "compact", label: "Compact" },
            { k: "comfortable", label: "Cozy" },
            { k: "spacious", label: "Roomy" },
          ].map(o => (
            <button key={o.k} className={density === o.k ? "active" : ""} onClick={() => onChange({ density: o.k })}>{o.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Tweaks });
