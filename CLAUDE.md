# Coreo — Claude Code Guidelines

## Project layout

```
apps/web/src/
  app/          # Next.js App Router pages and API routes
  components/   # Dumb/presentational React components
  hooks/        # Custom React hooks (form state, UI state)
  lib/          # Services and helpers (business logic, data access)
  constants/    # All app-wide constants — single source of truth
  types/        # Shared TypeScript types derived from constants
```

---

## React components — keep them dumb

Components in `components/` must be purely presentational. They receive everything via props and emit events via callbacks. They must not:

- Import from `lib/` or call services directly
- Contain validation, transformation, or business logic
- Manage complex derived state — delegate to a hook

**Right pattern** — component receives everything it needs:
```tsx
export type ButtonProps = {
  label: string;
  disabled: boolean;
  onClick: () => void;
};

export function Button({ label, disabled, onClick }: ButtonProps) {
  return <button disabled={disabled} onClick={onClick}>{label}</button>;
}
```

**Wrong** — component owns logic:
```tsx
export function Button({ items }: { items: string[] }) {
  const disabled = items.length === 0; // logic belongs in the hook
  return <button disabled={disabled}>Submit</button>;
}
```

Page files (`app/**/page.tsx`) wire hooks → components. They are the only place where hooks and components meet.

---

## Hooks — own UI state and coordination

Hooks in `hooks/` own form state, derived values, validation, and event handlers. They call services from `lib/` when needed. They must not render JSX.

- One hook per feature area (e.g. `useChoreographyForm`, `useAuthForm`)
- Validate inside the hook using helpers from `lib/` — never inside components
- Return a flat object of values + setters + handlers

---

## Services and helpers — own business logic

All business logic, data access, and external API calls live in `lib/`. These are plain TypeScript functions — no React dependencies.

- `lib/auth-store.ts` — user store operations
- Add new domain services here: `lib/choreography-service.ts`, `lib/api.ts`, etc.
- Helpers that are pure functions (formatters, validators, transformers) also live in `lib/`

---

## Constants — no string literals

**Every** magic value must be a named constant. Never use inline string or number literals for domain values.

All constants live in `constants/`. Group by domain:

```
constants/
  choreography.ts   # styles, difficulties, durations
  auth.ts           # routes, error messages, limits
  ui.ts             # class names, breakpoints, timeouts
```

**Right:**
```ts
import { ROUTE_LOGIN } from "../constants/auth";
redirect(ROUTE_LOGIN);
```

**Wrong:**
```ts
redirect("/login");
```

Types derived from constants stay in `types/` using `typeof CONSTANT[number]`:
```ts
export type ChoreographyStyle = (typeof ALL_STYLES)[number];
```

---

## Styling — CSS Modules, not inline classes

Keep styles out of JSX. Every component gets a co-located CSS Module file. Tailwind utilities are composed there via `@apply`; the component only references semantic class names.

**File layout:**
```
components/
  ChoreographyForm.tsx
  ChoreographyForm.module.css
```

**Right** — styles in the module, JSX stays clean:
```css
/* ChoreographyForm.module.css */
.form       { @apply w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#0D0D0D] p-6; }
.label      { @apply text-sm font-medium text-zinc-200; }
.input      { @apply mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm; }
.submitBtn  { @apply inline-flex items-center rounded-xl bg-[#F5C842] px-4 py-2 text-sm font-semibold text-black disabled:opacity-40; }
```

```tsx
import styles from "./ChoreographyForm.module.css";

export function ChoreographyForm(props: ChoreographyFormProps) {
  return (
    <form className={styles.form} onSubmit={props.onSubmit}>
      <label className={styles.label}>Style</label>
      <input className={styles.input} ... />
      <button className={styles.submitBtn} disabled={!props.isValid}>Generate</button>
    </form>
  );
}
```

**Wrong** — Tailwind utilities directly on JSX elements:
```tsx
<form className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#0D0D0D] p-6">
```

**Rules:**
- One `.module.css` per component, same name, same folder
- Class names in the module are semantic (`form`, `label`, `errorText`), not utility replicas
- Conditional classes use `clsx` or template literals with module keys — never string literals
- Global styles (`globals.css`) only for resets, CSS variables, and base typography
- Do not use `style={{}}` inline props unless driven by a dynamic runtime value (e.g. a JS-calculated width)

---

## TypeScript rules

- Prefer `type` over `interface` unless declaration merging is needed
- Derive types from constants — don't duplicate literal unions
- Never use `any`; use `unknown` and narrow explicitly
- Props types are named `<ComponentName>Props` and exported alongside the component

---

## File naming

| Artifact | Convention | Example |
|---|---|---|
| Component | PascalCase `.tsx` | `ChoreographyForm.tsx` |
| Component styles | Same name `.module.css` | `ChoreographyForm.module.css` |
| Hook | camelCase, `use` prefix `.ts` | `useChoreographyForm.ts` |
| Service / helper | kebab-case `.ts` | `auth-store.ts` |
| Constants file | kebab-case `.ts` | `choreography.ts` |
| Types file | kebab-case `.ts` | `choreography.ts` |
