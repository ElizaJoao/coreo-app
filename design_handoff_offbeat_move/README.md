# Handoff: Offbeat Move — Choreography Planner Redesign

## Overview

This handoff covers a redesign of **Offbeat Move** (the Next.js app in `apps/web/`). The new design expands the existing choreography dashboard with a richer, music-inspired planner: a dashboard with stats and weekly schedule, a player-style detail view with timeline playback, a guided multi-step generator flow, a library list view, and supporting screens (schedule, insights, settings).

The aesthetic extends the existing codebase — same deep black surfaces, amber `#F5C842` accent, Inter type, `rounded-2xl` card language — but adds a music-player visual vocabulary: waveforms, BPM pills, transport controls, track-style timelines, and pulse animations synced to beat.

## About the Design Files

The files in `prototype/` are **design references created in HTML** — React + Babel in-browser, not production code. They demonstrate intended look and behavior.

**The task is to recreate these designs in the existing Next.js environment** at `apps/web/src/` following the project's established patterns:

- Dumb presentational components in `components/` with co-located `.module.css` files
- Hooks in `hooks/` own UI state and coordination
- Services/helpers in `lib/`, no React deps
- All domain values from `constants/` (never inline strings)
- CSS Modules with `@apply` of Tailwind utilities — no utility classes in JSX
- Types derived from constants in `types/`

Do not copy HTML/CSS directly. Reimplement each screen as Next.js App Router pages + React components per the `CLAUDE.md` rules in the repo root.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, and interactions. Recreate pixel-perfectly using the existing Tailwind v4 + CSS Modules setup. Exact tokens listed in the Design Tokens section below.

## Screens / Views

### 1. Dashboard — `app/dashboard/page.tsx`

**Purpose**: Instructor's landing view. See class load, recent work, jump into a new generation.

**Layout**:
- Sidebar (248px fixed) + main workspace with sticky topbar (64px tall)
- Page padding: `32px 28px 80px 28px`, max-width `1400px`
- Hero header: large title ("Today's *tempo*" — accent word italic) + subtitle + primary "Generate new" CTA
- Stats strip: 4-column grid of stat cards with mini waveform sparklines, 12px gap
- Week schedule row: 7 day-cards horizontal, `MON`–`SUN` with date + class count
- Filter chip bar: `All / Dance / Fitness` then divider then `All / Beginner / Intermediate / Advanced`
- Choreography card grid: `auto-fill, minmax(300px, 1fr)`, 14px gap. Includes a dashed "Generate" create-card at the end.

**Components**:

- **StatCard** — rounded-14px card, border `#232323`, bg `#0D0D0D`, padding `14px 16px`. Label uppercase 11px letter-spacing 0.08em color `#7a7a7a`. Value 24px weight 700 letter-spacing -0.02em tabular-nums. Trend 11px. Mini stat-wave absolute right-14 center-Y, 28px tall, vertical accent bars.
- **DayCell** — flex `1`, min-width 80px, rounded-14px, border `#232323`, text-center. Day name 10px uppercase letter-spacing 0.1em. Day number 22px weight 700 tabular-nums. Class count line with dot indicators. `.today` variant: border becomes accent, bg `oklch(0.82 0.17 85 / 0.14)`, day number colored accent.
- **ChoreoCard** — rounded-14px, border `#232323`, bg `#0D0D0D`, padding 18px, min-height 200px. Hover: border `#3a3a3a`, `translateY(-2px)`, shadow. Contents: style/category uppercase 11.5px accent, name 16px weight 600, BpmPill top-right, mini-waveform (32 bars), meta badges row, footer with "Used Xd ago" + plays count.
- **BpmPill** — mono font 11px, padding `3px 7px`, bg `#141414`, border `#232323`, rounded-6px. Includes a pulsing 6px accent dot — animation duration `60/bpm` seconds (ticks to the beat).
- **FilterChip** — 6px 12px, rounded-99px, border `#232323`, bg `#0D0D0D`. `.active` fills with accent, accent-ink text, weight 600.
- **Mini-waveform** — flex row of 2px-wide accent bars (opacity 0.55), heights from seeded pseudo-random in 15–100% range.

**Copy**:
- Title: `Today's tempo` (the word "tempo" has `.accent-word` class — italic, weight 800, accent color)
- Subtitle: `6 classes this week, 4 hours 15 minutes scheduled. Your students are waiting for the beat.`
- Empty create-card text: `Generate a choreography` / `Pick a style, BPM, and audience — AI builds the sequence.`

### 2. Choreography Detail — `app/dashboard/[id]/page.tsx`

**Purpose**: View and "play back" a generated choreography. Rehearse cues timed to the music.

**Layout**:
- Back link top-left ("← Back to dashboard")
- 2-column grid: main content `minmax(0, 1fr)` + side panel `340px`, 20px gap
- Side panel is sticky (`top: 80px`)

**Main — TrackShell**:
- Rounded-20px card, border `#232323`, bg `#0D0D0D`
- **Head**: 20px 24px padding, bottom border. Eyebrow ("DANCE · HIP HOP" uppercase accent letter-spacing 0.12em), then title 24px weight 700, then badges row (duration, difficulty, audience with icons). Right-aligned icon buttons (duplicate, more).
- **Transport bar**: padding 14px 24px, bg `#141414`, bottom border. Contains:
  - 44px circular play/pause button, bg accent, color accent-ink, scales 1.06 on hover
  - mono time display `M:SS / M:SS` (elapsed/total)
  - Clickable progress bar (6px tall, rounded-99px, gradient accent→hue+40 fill, seek on click)
  - Move counter pill "Move 3/10"
  - BpmPill with pulsing dot when playing
- **Moves list**: padding 8px, 4px gap. Each move-row:
  - Grid `40px 1fr auto`, 16px gap, 14px 16px padding, rounded-10px
  - Ordinal chip 32px square rounded-8px bg `#1c1c1c`, mono 12px font-weight 600, 2-digit zero-padded
  - Info: name 14px weight 600 + move-tag (uppercase 10px letter-spacing 0.08em `#7a7a7a`), description 12.5px `#7a7a7a`
  - Duration pill on right: mono 12px padding 4px 8px border `#232323` bg `#141414` rounded-6px
  - **Active state** (current move during playback): bg `oklch(0.82 0.17 85 / 0.14)`, ordinal chip flips to accent bg + accent-ink, duration pill brightens
  - Click a row → seek elapsed to cumulative time of that move's start

**Side panel stack**:

- **MusicPanel** (rounded-20px, border, bg `#0D0D0D`):
  - Head: eyebrow "SUGGESTED SOUNDTRACK" (accent, 10.5px, letter-spacing 0.12em) + music icon. Title 18px weight 700. Artist 13px `#7a7a7a`.
  - Meta grid: 3 columns divided by borders. Tempo (mono 18px weight 700), Time sig (4/4), Key (A min).
  - Full waveform: 70px tall, bars sized from seeded data, `.played` = accent color, `.cursor` = white. Updates as playback progresses.

- **NotesPanel** — rounded-20px card, padding 18px 20px, h3 uppercase 12px `#7a7a7a`, body 13px `#b4b4b4` line-height 1.55. Shows instructor notes.

- **CueSheetPanel** — same frame, h3 "CUE SHEET". List of time+name rows, mono time 11px `#555` in 46px fixed width. Dashed bottom border between items.

**Interactions**:
- Playback uses `setInterval` at ~120ms (accelerated demo tempo). For production, use real second-tick or sync to audio element if playing actual music.
- Seeking via transport bar click: compute `elapsed = total * (clickX - rect.left) / rect.width`
- Seeking via move-row click: sum durations of preceding moves
- Active move index computed from cumulative durations vs. elapsed
- BPM pulse animation duration = `60/bpm` seconds, `animation-play-state: running` only when playing

### 3. New Choreography Flow — `app/dashboard/new/page.tsx`

**Purpose**: Guided multi-step form to generate a choreography. Replaces the current `ChoreographyForm`.

**Layout**:
- Narrow page: max-width 920px
- Back link, hero header ("Compose a *new set*" — "new set" italic accent)
- Single rounded-20px form-card containing 4 form-sections divided by borders, then a footer bar

**Sections**:

1. **01 · Discipline** — "Dance / Fitness" pill-tab switcher (bg `#141414`, active tab bg `#0D0D0D`). Then grid of style options (`auto-fill, minmax(140px, 1fr)`, 8px gap). Each option: padding 10px 12px, border, rounded-10px, weight 500. `.selected` = accent bg, accent-ink, weight 600.
2. **02 · Duration & tempo** — Large duration display: "45" at 44px weight 800 letter-spacing -0.04em accent color, with "min" unit. Range slider over the 5 DURATIONS values (15/30/45/60/90), labels below in mono 11px with active one colored accent. Below that: BPM slider 60–180 with a large mono readout (32px accent) on the right. Labels: "60 · slow / 120 · mid / 180 · hot".
3. **03 · Difficulty** — 3-column segment. Each diff-opt: padding 14px 12px, rounded-10px, border. Shows level name (14px weight 700), short description, and 1/2/3 accent dots for visual difficulty. `.selected` = accent border, tinted bg, name colored accent.
4. **04 · Audience & notes** — Field label (uppercase 12px letter-spacing 0.1em `#7a7a7a`). Text input (padding 12px 14px, bg `#141414`, border, rounded-10px). Textarea below with same styling, min-height 90px. On focus: border `#3a3a3a`, bg `#1c1c1c`.

**Footer bar**: bg `#141414`, top border, padding 18px 26px. Left: hint text with sparkle icon — "Claude will draft 8–14 moves totalling ~45 min". Right: Cancel + Generate buttons.

**Generating overlay** (when submitted):
- Full-screen backdrop `oklch(from bg l c h / 0.85)`, blur 8px, fade in
- Center card: rounded-20px, 36px 40px padding, max-width 420px
- Animated waveform: 22 accent bars, each with `animation: wave 1.1s ease-in-out infinite`, stagger `animation-delay: i * 40ms`, keyframes 10%→100%→10% height
- Title "Composing your Hip Hop set", sub "Building at 118 BPM · drawing from 10k patterns"
- Step list of 4 stages: "Reading your brief / Structuring the sequence / Matching tempo to audience / Picking a soundtrack". Each step gains a check icon when complete, accent pulse when active.
- Steps advance on timers at 700/1500/2400ms, completes at 3200ms and navigates to dashboard.

### 4. Library — `app/dashboard/library/page.tsx` (new route)

List view alternative to the dashboard grid.

- Page header + sort chips (Most played / Duration / BPM)
- Table-style list: header row + data rows in a single rounded-20px container
- Columns: `2fr 1fr 0.8fr 0.8fr 1fr 60px` (Name / Style / Duration / BPM / Last used / [dots menu])
- Name cell has a 32px square icon-thumb (accent bg, music icon), name + "N moves · audience" subline
- Style cell has accent pill + category subline
- Numeric cells use mono font
- Rows hover bg `#141414`, click → detail

### 5. Schedule — `app/dashboard/schedule/page.tsx` (new route)

- Same 7-day row as dashboard but full-width
- Below: dashed empty-state card with calendar icon — "Drop choreographies onto days / Drag from the library to schedule a class."

### 6. Insights — `app/dashboard/insights/page.tsx` (new route)

- 3-column stats (dance/fitness counts, avg plays per week)
- Dashed empty-state — "Attendance analytics coming soon / Connect your booking system…"

### 7. Settings — `app/dashboard/settings/page.tsx` (new route)

- Narrow form-card
- Studio name + instructor handle inputs
- Default class length: 5-column grid of duration options styled like style-opts

### 8. Sidebar — Component `Sidebar.tsx`

**Layout**: 248px fixed, sticky top, full viewport height, padding 20px 14px, flex column, 4px gap.

- **Brand** (top): 28px accent square mark with "O" (weight 800, repeating subtle stripe overlay), "Offbeat" name (weight 700, 15px), "MOVE · STUDIO" subtitle (11px `#7a7a7a` letter-spacing 0.02em)
- **Nav-group-label**: uppercase 10.5px letter-spacing 0.1em `#555` padding 14px 12px 6px
- **Nav-items**: padding 8px 10px, rounded-10px, gap 10px icon+label. Active: bg `#141414`, icon colored accent. Right-side count badge mono 11px.
- **User-pill** (bottom, `margin-top: auto`): padding 10px, rounded-12px, bg `#0D0D0D`, border. 30px circular gradient avatar (accent → hue+40), initials, name+email stack.

**Nav items** (top to bottom):
1. Dashboard (home icon)
2. New choreography (sparkle icon)
3. Library (library icon) + count
4. Schedule (calendar icon)
5. Insights (trending icon)
6. [Account group] Settings (gear icon)

### 9. Topbar — Component `Topbar.tsx`

Sticky, 16px 28px, bottom border, backdrop blur 12px, bg `#000000`.

- Left: breadcrumb chain ("Dashboard / Midnight Pulse"), separators `#555`, final crumb full white
- Center-right: 260px search input with search icon left and "⌘K" shortcut pill right
- Right: primary "+ New" button

## Interactions & Behavior

- **Routing**: keep the existing `app/dashboard/*` structure. Add new routes for `library`, `schedule`, `insights`, `settings` under `app/dashboard/`.
- **Playback state** lives in a `useChoreographyPlayback` hook: `{ elapsed, playing, play(), pause(), seek(sec), activeMoveIndex }`. Computes activeMoveIndex from cumulative move durations.
- **Generation flow**: existing `useChoreographyGenerator` can stay; wrap overlay progression in a `useGenerationProgress` hook that ticks stages on timers; replace placeholder with real Claude call completion.
- **BPM pulse**: pure CSS animation, `animation-duration: ${60/bpm}s`, `animation-play-state` controlled by a `data-playing` attribute.
- **Seek-on-click** on progress bar and move rows.
- **Hover states**: all cards lift 2px + shadow; nav items darken bg; chips border-color brightens.
- **Transitions**: 120ms for colors/bg; 160ms for card hover; 200ms fade on overlay.
- **Keyboard**: spacebar toggles play/pause on detail view (nice-to-have).

## State Management

Add to `hooks/`:

- `useChoreographyPlayback(choreography)` — owns `elapsed`, `playing`, returns handlers. Uses `setInterval` cleanup pattern.
- `useNewChoreographyForm` (extend the existing `useChoreographyForm`) — add `category`, `bpm`, `audience` fields; category drives which style list is shown.
- `useGenerationProgress` — owns `step` (0..3), ticks on timer, fires `onComplete`.

No global state needed — all page-local.

## Design Tokens

### Colors (dark mode — default)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#000000` | App background |
| `--surface` | `#0D0D0D` | Cards, panels |
| `--surface-2` | `#141414` | Inputs, transport bar, elevated surfaces |
| `--surface-3` | `#1c1c1c` | Ordinal chips, deepest wells |
| `--surface-hover` | `#1a1a1a` | Hover state on surface |
| `--border` | `#232323` | Default borders |
| `--border-2` | `#2e2e2e` | Hover borders |
| `--border-3` | `#3a3a3a` | Focus borders |
| `--text` | `#f4f4f4` | Primary text |
| `--text-2` | `#b4b4b4` | Secondary text / body |
| `--text-3` | `#7a7a7a` | Tertiary / subtitles |
| `--text-4` | `#555555` | Quaternary / disabled |
| `--accent` | `oklch(0.82 0.17 85)` ≈ `#F5C842` | Primary brand accent |
| `--accent-soft` | `oklch(0.82 0.17 85 / 0.14)` | Tinted backgrounds |
| `--accent-soft-2` | `oklch(0.82 0.17 85 / 0.22)` | Stronger tint |
| `--accent-ink` | `oklch(0.18 0.06 85)` | Text on accent fills (near-black) |

### Colors (light mode — Tweak)

| Token | Value |
|---|---|
| `--bg` | `#f2f1ee` |
| `--surface` | `#ffffff` |
| `--surface-2` | `#f7f6f3` |
| `--surface-3` | `#eeede9` |
| `--border` | `#e2e0db` |
| `--text` | `#111111` |
| Same accent | (unchanged) |

### Typography

- **Font family**: `Inter`, variable weight (400/500/600/700/800). Features: `"cv11", "ss01", "ss03"`.
- **Mono**: `JetBrains Mono` 400/500 for BPM, time, durations, table numerics.
- Body default: 14px, line-height 1.5.
- Letter-spacing: tight tracking (`-0.01em` to `-0.03em`) for display type; wide (`0.08em`–`0.12em`) for uppercase labels.

### Type scale

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

### Spacing

8px grid. Row padding 14px 16px (default), 10px 12px (compact Tweak), 18px 20px (roomy Tweak).

### Radii

- `--radius-lg`: 20px — main container cards
- `--radius-md`: 14px — stat cards, smaller containers
- `--radius-sm`: 10px — inputs, chips, move rows
- 99px for pill badges
- 50% for avatars, play button

### Shadows

- Card hover: `0 12px 24px -16px rgba(0,0,0,0.6)`
- Play button hover: scale only (no shadow)
- Overlay: `0 20px 40px -10px rgba(0,0,0,0.4), 0 0 0 1px var(--border)`
- Primary button: `0 1px 0 oklch(1 0 0 / 0.2) inset, 0 4px 12px -6px var(--accent)`

### Animations

- `pulse` (BPM dot): scale 0.7→1.1→0.7, opacity 0.5→1→0.5, duration `60/bpm`s infinite
- `wave` (gen overlay bars): height 10%→100%→10%, 1.1s ease-in-out infinite, staggered by 40ms
- `fadein` (overlay): opacity 0→1, 200ms ease-out
- Card hover: 160ms all
- Color/bg transitions: 120ms

## Tweaks (optional, if the project supports runtime theming)

The prototype exposes a small tweaks panel with three controls:
1. **Theme**: `dark` / `light` — swaps CSS variable block on `html[data-theme]`
2. **Accent hue**: 0–360 slider, sets `--accent-h` (used inside `oklch(0.82 0.17 var(--accent-h))`)
3. **Density**: `compact` / `comfortable` / `spacious` — swaps `--row-pad-y` / `--row-pad-x`

This can be deferred. If shipping: persist via localStorage or user preferences.

## Assets

- **Fonts**: `Inter` and `JetBrains Mono` from Google Fonts. Weights: Inter 400/500/600/700/800, Mono 400/500.
- **Icons**: minimal Lucide-style stroke icons drawn inline as SVG. Any equivalent (lucide-react, heroicons) will match.
- **No raster imagery** — waveforms and pulses are generated from seeded pseudo-random data (`makeWaveform(seed, count)` in `prototype/src/data.jsx`) rendered as styled divs.

## Files

Located in `prototype/`:

- `Offbeat Move.html` — entry, loads all scripts
- `app.css` — full stylesheet with tokens and component styles (single file; split into CSS Modules per component during porting)
- `src/data.jsx` — mock choreographies, stats, week, waveform generator
- `src/icons.jsx` — inline SVG icon components
- `src/ui.jsx` — shared helpers (Waveform, MiniWaveform, BpmPill, Badge, StatWave)
- `src/sidebar.jsx` — Sidebar + Topbar
- `src/dashboard.jsx` — Dashboard + StatCard + ChoreoCard + CreateCard
- `src/detail.jsx` — full detail view with transport, moves list, music panel, cue sheet
- `src/newflow.jsx` — 4-step new-choreography form + generating overlay
- `src/library.jsx` — Library table + Schedule/Insights/Settings placeholders
- `src/tweaks.jsx` — runtime tweaks panel
- `src/app.jsx` — router, tweaks wiring, localStorage persistence

## Implementation Order (suggested)

1. **Tokens first** — extend `globals.css` with the full CSS custom property set above.
2. **Sidebar + Topbar + route shell** — `app/dashboard/layout.tsx` with the sidebar/topbar wrapping all dashboard routes.
3. **Dashboard** — StatCard, ChoreoCard, DayCell, filter chips.
4. **Detail** — the transport + moves list is the most interactive piece. Build `useChoreographyPlayback` first.
5. **New flow** — replace existing `ChoreographyForm` with the 4-section layout + generating overlay. Wire to existing `useChoreographyGenerator`.
6. **Library/Schedule/Insights/Settings** routes.
7. **Tweaks** (optional).

## Codebase conventions reminder

From `CLAUDE.md` (reproduced so you don't have to re-read it):

- Components are purely presentational — props in, callbacks out. No `lib/` imports.
- Hooks own state, validation, event handlers — never render JSX.
- All magic values are named constants in `constants/`. Existing: `DANCE_STYLES`, `FITNESS_STYLES`, `DIFFICULTIES`, `DURATIONS`, `ALL_STYLES`. Add new ones for routes, copy, and animation durations as needed.
- Types derived from constants live in `types/`.
- One `.module.css` per component, same folder. Semantic class names; Tailwind utilities via `@apply` only.
- No `any`. Prefer `type` over `interface`.
- File naming: PascalCase components, camelCase `use*` hooks, kebab-case services/constants/types.
