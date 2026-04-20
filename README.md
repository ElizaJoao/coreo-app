# Offbeat Move

AI-powered choreography planning for fitness and dance instructors.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS Modules |
| Auth | NextAuth v5 (JWT + Credentials) |
| Database | Supabase (PostgreSQL) |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| Email | Resend |
| SMS | Twilio |

## Project Structure

```
apps/web/src/
  app/              # Next.js App Router pages and API routes
    api/auth/       # signup, verify, resend-verification, [...nextauth]
    api/choreography/generate/
    dashboard/      # list, [id], new
    login/
    signup/
    verify/
  components/       # Presentational React components (CSS Modules)
  hooks/            # UI state, form logic, event handlers
  lib/              # Services and helpers (no React)
  constants/        # Single source of truth for all magic values
  types/            # TypeScript types derived from constants
```

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key
- A [Resend](https://resend.com) account (email verification)
- A [Twilio](https://twilio.com) account (SMS verification, optional)

### Installation

```bash
git clone https://github.com/ElizaJoao/coreo-app.git
cd coreo-app
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp apps/web/.env.example apps/web/.env.local
```

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random secret for NextAuth — run `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) |
| `TWILIO_ACCOUNT_SID` | From [twilio.com](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Your Twilio number, e.g. `+15550001234` |

### Database

The Supabase schema is managed via migrations. Tables required:

- `users` — email/password accounts
- `choreographies` — AI-generated plans, linked to a user
- `pending_signups` — temporary records during 2-step verification (auto-cleaned on verify)

### Run Locally

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## Features

### Authentication

- Credential-based signup and login
- **2-step email or SMS verification** on signup — a 6-digit code is sent and must be entered before the account is created
- NextAuth JWT sessions; middleware protects `/dashboard/*`
- Edge-safe middleware: `auth.config.ts` handles route protection, `auth.ts` handles credentials

### Choreography Generation

1. Sign in and go to **Dashboard → New**
2. Fill the form: style, duration, difficulty, target audience
3. Claude generates a structured choreography plan using tool-use
4. Result is saved to Supabase and displayed at `/dashboard/[id]`

## Architecture Notes

- **Dumb components** — `components/` are purely presentational; all logic lives in hooks or `lib/`
- **CSS Modules** — Tailwind utilities composed via `@apply` inside `.module.css` files; no inline class strings in JSX
- **No string literals** — every route, error message, and domain value is a named constant in `constants/`
- **Server-side Supabase** — the service role client is never exposed to the browser

## Domain

[offbeatmove.com](https://offbeatmove.com)
