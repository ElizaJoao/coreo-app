# Offbeat Move — Design Spec

Design reference for the Offbeat Move redesign. This document is the single source of truth for **what the app should look and feel like**. For implementation conventions (component rules, file layout, CSS Modules, constants), see `CLAUDE.md`. For the fully-built prototype, see `design_handoff_offbeat_move/prototype/`.

---

## 1. Design concept

Offbeat Move is an AI-powered choreography planner for fitness and dance instructors. The redesign pushes the product's visual vocabulary toward a **music player / studio console** metaphor:

- **Waveforms, BPM pills, transport controls, track-style timelines**
- **Pulse animations synced to beat** (the BPM dot literally ticks at `60/bpm` seconds)
- **Deep black surfaces** with a single amber accent, treated like studio hardware
- **Tabular mono numerics** (BPM, durations, timecodes) for a technical, instrument-like feel

It should read as "the choreography I'm building is a track I can rehearse to," not "a generic CRM for classes."

---

## 2. Design tokens

All tokens are defined as CSS custom properties on `:root` and swapped via `html[data-theme]` / `html[data-density]` attributes. Mirror this block in `globals.css`.

### 2.1 Color — dark (default)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#000000` | App background |
| `--surface` | `#0D0D0D` | Cards, panels |
| `--surface-2` | `#141414` | Inputs, transport bar, elevated surfaces |
| `--surface-3` | `#1C1C1C` | Ordinal chips, deepest wells |
| `--surface-hover` | `#1A1A1A` | Row/card hover |
| `--border` | `#232323` | Default borders |
| `--border-2` | `#2E2E2E` | Hover borders |
| `--border-3` | `#3A3A3A` | Focus borders |
| `--text` | `#F4F4F4` | Primary text |
| `--text-2` | `#B4B4B4` | Body / secondary |
| `--text-3` | `#7A7A7A` | Subtitles, captions |
| `--text-4` | `#555555` | Disabled, time stamps |
| `--accent` | `oklch(0.82 0.17 var(--accent-h))` ≈ `#F5C842` | Brand accent (amber) |
| `--accent-soft` | `oklch(0.82 0.17 var(--accent-h) / 0.14)` | Tinted fills (active rows) |
| `--accent-soft-2` | `oklch(0.82 0.17 var(--accent-h) / 0.22)` | Stronger tint (selection) |
| `--accent-ink` | `oklch(0.18 0.06 var(--accent-h))` | Text on accent fills (near-black) |
| `--danger` | `oklch(0.72 0.19 25)` | Destructive |
| `--success` | `oklch(0.78 0.16 155)` | Confirmations |

The accent is parameterized via `--accent-h` (default `85`) so the Tweaks panel can rotate hue without re-authoring other tokens.

### 2.2 Color — light (Tweak)

Swap on `html[data-theme="light"]`:

| Token | Value |
|---|---|
| `--bg` | `#F2F1EE` |
| `--surface` | `#FFFFFF` |
| `--surface-2` | `#F7F6F3` |
| `--surface-3` | `#EEEDE9` |
| `--border` | `#E2E0DB` |
| `--text` | `#111111` |
| `--accent-ink` | `#111111` |

Accent itself is unchanged across themes.

### 2.3 Typography

- **Body / UI:** `Inter` (variable), weights 400/500/600/700/800. Features `"cv11", "ss01", "ss03"`.
- **Mono:** `JetBrains Mono` 400/500. Used for BPM, timecodes, durations, table numerics. Feature `"zero"`.
- **Base:** `14px` / line-height `1.5`.
- **Tracking:** `-0.01em` to `-0.03em` for display; `0.08em`–`0.12em` for uppercase labels.

Type scale:

| Role | Size | Weight | Letter-spacing |
|---|---|---|---|
| Page title | 34px | 700 | -0.03em |
| Track title | 24px | 700 | -0.02em |
| Section title | 16px | 600 | -0.015em |
| Card name | 16px | 600 | -0.015em |
| Body | 14px | 400 | — |
| Secondary | 13px | 400 | — |
| Small | 12.5px | 400 | — |
| Uppercase label | 10.5–12px | 600 | 0.08–0.12em |
| Mono time/BPM | 11–13px | 500–700 | -0.02em |

Accent-word treatment (used in hero titles like "Today's *tempo*"): same size, `font-style: italic`, `font-weight: 800`, `color: var(--accent)`.

### 2.4 Spacing, radii, shadows

- **Grid:** 8px. `--row-pad-y: 14px`, `--row-pad-x: 16px` by default.
  - `compact` → 10/12 · `spacious` → 18/20 (density Tweak).
- **Radii:** `--radius-lg: 20px` (containers), `--radius-md: 14px` (stat cards), `--radius-sm: 10px` (inputs, chips, move rows). `99px` for pills. `50%` for avatars and the play button.
- **Shadows:**
  - Card hover: `0 12px 24px -16px rgba(0,0,0,0.6)`
  - Overlay: `0 20px 40px -10px rgba(0,0,0,0.4), 0 0 0 1px var(--border)`
  - Primary button: `0 1px 0 oklch(1 0 0 / 0.2) inset, 0 4px 12px -6px var(--accent)`

### 2.5 Motion

| Name | Spec | Where |
|---|---|---|
| `pulse` | scale 0.7→1.1→0.7, opacity 0.5→1→0.5, duration `60/bpm`s, infinite | BPM dot |
| `wave` | height 10%→100%→10%, 1.1s ease-in-out infinite, stagger 40ms | Generation overlay bars |
| `fadein` | opacity 0→1, 200ms ease-out | Overlays |
| Card hover | 160ms all | Cards lift 2px + shadow |
| Color/bg | 120ms | Chips, nav items, inputs |

---

## 3. App shell

```
┌─────────────┬────────────────────────────────────────────┐
│             │  Topbar (sticky, 64px, blur 12px)          │
│  Sidebar    ├────────────────────────────────────────────┤
│  248px      │                                            │
│  fixed      │   Workspace · max-width 1400px             │
│             │   padding 32px 28px 80px 28px              │
│             │                                            │
└─────────────┴────────────────────────────────────────────┘
```

- Shell grid: `248px 1fr`, full viewport height.
- Workspace has `border-left: 1px solid var(--border)` against sidebar.

### 3.1 Sidebar (`components/Sidebar.tsx`)

- 248px, sticky, full viewport height. Padding `20px 14px`, flex column, 4px gap.
- **Brand block (top):** 28px accent square mark with "O" (weight 800, subtle repeating stripe overlay) + wordmark "Offbeat" (15px/700) + subtitle "MOVE · STUDIO" (11px, `--text-3`, letter-spacing 0.02em).
- **Nav group label:** uppercase 10.5px, letter-spacing 0.1em, `--text-4`, padding `14px 12px 6px`.
- **Nav item:** padding `8px 10px`, `rounded-10px`, 10px gap between icon + label. Active: bg `--surface-2`, icon colored `--accent`. Optional trailing mono 11px count badge.
- **User pill (bottom, `margin-top:auto`):** padding 10px, `rounded-12px`, bg `--surface`, border. 30px circular avatar with gradient `accent → hue+40`, initials, name + email stack.

Nav items (top → bottom): Dashboard · New choreography · Library (+count) · Schedule · Insights · [Account group] Settings.

### 3.2 Topbar (`components/Topbar.tsx`)

- Sticky, `16px 28px`, bottom border `--border`, `backdrop-filter: blur(12px)`, bg `#000000` (semi if theme=light).
- **Left:** breadcrumb chain, separators `--text-4`, final crumb `--text`.
- **Center-right:** 260px search with search icon left and `⌘K` shortcut pill right.
- **Right:** primary `+ New` button (accent bg, accent-ink text).

---

## 4. Screens

Add new routes under `app/dashboard/` for `library`, `schedule`, `insights`, `settings`. All pages compose inside the shell layout (`app/dashboard/layout.tsx`).

### 4.1 Dashboard — `app/dashboard/page.tsx`

**Purpose:** instructor's landing. See class load, jump into generation.

Structure:
1. **Hero** — title "Today's *tempo*" + subtitle + primary `Generate new` CTA on the right.
2. **Stats strip** — 4-col grid of StatCards, 12px gap.
3. **Week schedule row** — 7 DayCells, `MON`–`SUN`.
4. **Filter chip bar** — `All / Dance / Fitness` · divider · `All / Beginner / Intermediate / Advanced`.
5. **Choreography grid** — `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`, 14px gap. Trailing dashed CreateCard.

Hero copy (exact):
- Title: `Today's tempo` (wrap "tempo" in `.accent-word`)
- Sub: `6 classes this week, 4 hours 15 minutes scheduled. Your students are waiting for the beat.`
- CreateCard: `Generate a choreography` / `Pick a style, BPM, and audience — AI builds the sequence.`

### 4.2 Choreography detail — `app/dashboard/[id]/page.tsx`

2-column grid: `minmax(0,1fr) 340px`, 20px gap. Side panel sticky `top: 80px`. Back link above.

**TrackShell (main):** rounded-20px card, border, bg `--surface`.
- **Head** (`20px 24px`, bottom border): eyebrow "DANCE · HIP HOP" (accent, uppercase, 10.5px, letter-spacing 0.12em) → track title (24px/700) → badges row (duration · difficulty · audience with icons). Right-aligned icon buttons (duplicate, more).
- **Transport bar** (`14px 24px`, bg `--surface-2`, bottom border):
  - 44px circular play/pause; bg `--accent`, color `--accent-ink`; scales 1.06 on hover.
  - Mono `M:SS / M:SS` time display.
  - Clickable 6px progress bar, rounded-99px, gradient `accent → hue+40`, seeks on click.
  - Move counter pill `Move 3/10`.
  - `BpmPill` with pulsing dot (dot animates only while `playing`).
- **Moves list** (padding 8px, 4px gap between rows). Each row is `grid: 40px 1fr auto / 16px gap`, `14px 16px`, `rounded-10px`:
  - Ordinal chip 32px square, `rounded-8px`, bg `--surface-3`, mono 12px/600, 2-digit zero-padded.
  - Info: move name (14px/600) + move-tag (uppercase 10px, letter-spacing 0.08em, `--text-3`), description (12.5px, `--text-3`).
  - Duration pill right: mono 12px, `4px 8px`, border, bg `--surface-2`, rounded-6px.
  - **Active** (during playback): bg `--accent-soft`, ordinal chip flips to accent bg + accent-ink, duration pill brightens.
  - Click row → seek elapsed to cumulative start time of that move.

**Side panel stack:**
- **MusicPanel** — eyebrow "SUGGESTED SOUNDTRACK" + music icon → title 18px/700 → artist 13px `--text-3` → 3-column meta grid divided by borders (`Tempo` mono 18/700 · `Time sig` 4/4 · `Key` A min) → full 70px-tall waveform with `.played` (accent) and `.cursor` (white) bars that update with playback.
- **NotesPanel** — h3 uppercase 12px `--text-3`, body 13px `--text-2`, line-height 1.55.
- **CueSheetPanel** — list of `[mono time · name]` rows; time 11px `--text-4`, fixed 46px width; dashed bottom border between items.

**Playback behavior:**
- Lives in `useChoreographyPlayback(choreography)` → `{ elapsed, playing, play(), pause(), seek(sec), activeMoveIndex }`.
- Demo tick: `setInterval` ~120ms. Production: real 1s tick or sync to HTMLAudioElement if actual music is loaded.
- `activeMoveIndex` = largest `i` such that `sum(moves[0..i].duration) <= elapsed`.
- Seek on progress-bar click: `elapsed = total * (clickX - rect.left) / rect.width`.
- Spacebar toggles play/pause (nice-to-have).

### 4.3 New choreography — `app/dashboard/new/page.tsx`

Replace the existing `ChoreographyForm`. Narrow page, max-width 920px.

- Back link → hero "Compose a *new set*" (accent-word on "new set") → single rounded-20px form-card with 4 sections divided by 1px borders, then a footer bar.

Sections:
1. **01 · Discipline** — `Dance / Fitness` pill-tab switcher (bg `--surface-2`, active tab bg `--surface`). Below: grid of style options, `auto-fill, minmax(140px, 1fr)`, 8px gap. Option: `10px 12px`, border, rounded-10px, weight 500. `.selected` = accent bg, accent-ink text, weight 600.
2. **02 · Duration & tempo** — Big readout: "45" at 44px/800, letter-spacing -0.04em, accent color, with "min" unit. Range slider over DURATIONS `[15, 30, 45, 60, 90]`, tick labels in mono 11px, active label colored accent. Below: BPM slider 60–180 with 32px mono accent readout right-aligned. Footer labels: `60 · slow / 120 · mid / 180 · hot`.
3. **03 · Difficulty** — 3-column segment. Each option: `14px 12px`, rounded-10px, border. Level name (14px/700) + short description + 1/2/3 accent dots. `.selected` = accent border, `--accent-soft` bg, name colored accent.
4. **04 · Audience & notes** — Field label uppercase 12px, letter-spacing 0.1em, `--text-3`. Text input: `12px 14px`, bg `--surface-2`, border, rounded-10px. Textarea same styling, min-height 90px. Focus: border `--border-3`, bg `--surface-3`.

Footer bar: bg `--surface-2`, top border, `18px 26px`. Left: sparkle icon + "Claude will draft 8–14 moves totalling ~45 min". Right: `Cancel` + `Generate` (primary).

**Generating overlay** (on submit):
- Full-screen backdrop `oklch(from var(--bg) l c h / 0.85)`, `backdrop-filter: blur(8px)`, fade in.
- Center card: rounded-20px, `36px 40px`, max-width 420px.
- 22 accent bars animating `wave 1.1s ease-in-out infinite`, stagger `i * 40ms`, keyframes 10%→100%→10%.
- Title: `Composing your Hip Hop set`, sub: `Building at 118 BPM · drawing from 10k patterns`.
- 4-step list: `Reading your brief / Structuring the sequence / Matching tempo to audience / Picking a soundtrack`. Steps complete at 700ms · 1500ms · 2400ms · 3200ms, then navigate to dashboard.
- Lives in `useGenerationProgress` hook — owns `step: 0..3`, fires `onComplete`.

### 4.4 Library — `app/dashboard/library/page.tsx`

Table list alt to the dashboard grid.

- Page header + sort chips (`Most played / Duration / BPM`).
- Single rounded-20px container: header row + data rows.
- Columns: `2fr 1fr 0.8fr 0.8fr 1fr 60px` (Name · Style · Duration · BPM · Last used · dots).
- Name cell: 32px square icon-thumb (accent bg, music icon) + name + sub "`N moves · audience`".
- Style cell: accent pill + category subline.
- Numeric cells use mono.
- Rows hover `--surface-2`, click → detail.

### 4.5 Schedule — `app/dashboard/schedule/page.tsx`

- Full-width 7-day row (reuse DayCell component).
- Below: dashed empty-state card with calendar icon — `Drop choreographies onto days / Drag from the library to schedule a class.`

### 4.6 Insights — `app/dashboard/insights/page.tsx`

- 3-column stats (dance count, fitness count, avg plays/week).
- Dashed empty-state — `Attendance analytics coming soon / Connect your booking system…`

### 4.7 Settings — `app/dashboard/settings/page.tsx`

- Narrow form-card.
- Studio name + instructor handle inputs.
- Default class length: 5-column grid of duration options, styled like style-opts.

---

## 5. Component catalog

Presentational components — all live in `components/` with co-located `.module.css`. See `CLAUDE.md` for styling rules (Tailwind utilities via `@apply` only, no utility strings in JSX).

| Component | Summary |
|---|---|
| `Sidebar` | 248px nav with brand, nav items, user pill. |
| `Topbar` | Sticky top bar with breadcrumbs, search, `+ New`. |
| `StatCard` | Rounded-14px card with label / value / trend + right-aligned mini stat-wave. |
| `DayCell` | Day name + date + class count, `.today` variant. |
| `ChoreoCard` | Dashboard grid card: category eyebrow, name, BpmPill, 32-bar mini-waveform, meta badges, footer stats. |
| `CreateCard` | Dashed border variant with plus icon and copy. |
| `FilterChip` | Pill chip, `.active` = accent fill + accent-ink text. |
| `BpmPill` | Mono 11px pill with pulsing 6px accent dot; animation duration `60/bpm`s, running only when `data-playing`. |
| `Badge` | Duration / difficulty / audience inline badges with icon + label. |
| `TrackShell` | Detail-view container (head + transport + moves list). |
| `TransportBar` | Play/pause + timecode + progress + move counter + BpmPill. |
| `MoveRow` | Ordinal chip + info + duration pill; active + click-to-seek. |
| `MusicPanel` | Soundtrack side-panel with meta grid + full waveform. |
| `NotesPanel` / `CueSheetPanel` | Rounded-20px side cards. |
| `Waveform` / `MiniWaveform` / `StatWave` | Seeded pseudo-random bar renderers (from `makeWaveform(seed, count)`). |
| `StyleOption` / `DifficultyOption` | New-flow selectable tiles. |
| `GeneratingOverlay` | Full-screen animated overlay with step list. |
| `LibraryTable`, `EmptyStateCard` | Library + schedule/insights placeholders. |

Icons: minimal Lucide-style 1.5-stroke SVGs, drawn inline (or `lucide-react` is fine — same visual weight).

---

## 6. State & hooks

Under `hooks/`:

- **`useChoreographyPlayback(choreography)`** → `{ elapsed, playing, play, pause, seek, activeMoveIndex }`. `setInterval` with cleanup. Derive `activeMoveIndex` from cumulative durations.
- **`useNewChoreographyForm`** — extends existing `useChoreographyForm` with `category` (dance/fitness), `bpm`, `audience`, `notes`. `category` drives which style list is shown.
- **`useGenerationProgress({ onComplete })`** — ticks `step: 0→3` on timers; fires `onComplete` at 3200ms.

No global state — everything is page-local.

---

## 7. Constants to add

Per `CLAUDE.md`, no string literals. Add to `constants/`:

- **`ui.ts`:** animation durations (`ANIMATION_CARD_HOVER_MS = 160`, `ANIMATION_FADE_MS = 200`, `ANIMATION_WAVE_MS = 1100`, `ANIMATION_WAVE_STAGGER_MS = 40`), sidebar width (`SIDEBAR_WIDTH_PX = 248`), breakpoint tokens.
- **`routes.ts`:** `ROUTE_DASHBOARD`, `ROUTE_NEW`, `ROUTE_LIBRARY`, `ROUTE_SCHEDULE`, `ROUTE_INSIGHTS`, `ROUTE_SETTINGS`.
- **`choreography.ts`** (extend): `BPM_MIN = 60`, `BPM_MAX = 180`, `BPM_DEFAULT = 118`, `MOVE_COUNT_MIN = 8`, `MOVE_COUNT_MAX = 14`.
- **`copy.ts`:** hero titles, subtitles, empty-state copy, generation-overlay step labels.
- **`generation.ts`:** step timings `[700, 1500, 2400, 3200]`.

Types in `types/` derived via `typeof CONSTANT[number]`.

---

## 8. Tweaks (optional, deferred)

If shipping the runtime tweaks panel:

1. **Theme** — `dark` / `light`, sets `html[data-theme]`.
2. **Accent hue** — 0–360 slider, sets `--accent-h`.
3. **Density** — `compact` / `comfortable` / `spacious`, sets `html[data-density]`.

Persist via localStorage keyed on user id, or user preferences table when available.

---

## 9. Assets

- **Fonts:** `Inter` (400/500/600/700/800), `JetBrains Mono` (400/500). Google Fonts.
- **Icons:** inline SVG, Lucide visual language (1.5 stroke, rounded linecaps).
- **No raster imagery.** Waveforms and stat sparklines are generated from seeded pseudo-random data (`makeWaveform(seed, count)` → array of heights 15–100%) and rendered as styled `<div>` bars.

---

## 10. Implementation order

1. **Tokens** — extend `globals.css` with the full custom property set (§2).
2. **Shell** — `app/dashboard/layout.tsx` with `Sidebar` + `Topbar`.
3. **Dashboard** — `StatCard`, `DayCell`, `FilterChip`, `ChoreoCard`, `CreateCard`, `MiniWaveform`, `BpmPill`.
4. **Detail** — build `useChoreographyPlayback` first, then `TrackShell` / `TransportBar` / `MoveRow` / `MusicPanel` / `NotesPanel` / `CueSheetPanel`.
5. **New flow** — 4-section form + `GeneratingOverlay`. Wire to existing `useChoreographyGenerator`.
6. **Library / Schedule / Insights / Settings** routes.
7. **Tweaks** (optional).

---

## 11. References

- **Prototype (HTML reference):** `design_handoff_offbeat_move/prototype/Offbeat Move.html` — do **not** copy the HTML/CSS directly; reimplement per project conventions.
- **Full prototype CSS (token + component source):** `design_handoff_offbeat_move/prototype/app.css`.
- **Handoff write-up (extended notes, copy, interaction details):** `design_handoff_offbeat_move/README.md`.
- **Engineering conventions:** `CLAUDE.md`.
