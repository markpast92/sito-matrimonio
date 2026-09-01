# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server on http://localhost:3000
npm run build    # production build (also validates TypeScript)
npm run start    # serve the production build
```

No test framework or linter is configured.

## Architecture

**Next.js 15 App Router** + TypeScript + Tailwind CSS v4. All pages are under `app/`, shared components under `components/`, utilities under `lib/`.

### Auth flow (two-tier)

`middleware.ts` intercepts every request (except `_next/static`, `_next/image`, `favicon.ico`):

1. **Guest gate** — checks `site_auth=ok` cookie. Missing → redirect to `/password`. `/api/auth` sets this cookie for 30 days.
2. **Admin gate** — `/admin/*` (except `/admin/login`) additionally requires `admin_auth=ok` cookie set by `/api/admin-auth`.

Guest name is collected once in `HomeClient` and stored in `localStorage` as `guest_name` / `guest_surname`. Pages pre-fill forms from localStorage on mount.

### Data layer

- `lib/supabase.ts` exports two factory functions: `supabaseAnon()` (public key, safe in client bundles) and `supabaseAdmin()` (service role key, **only use in API routes**).
- Database tables: `rsvp` (upserted on `nome,cognome`), `rsvp_accompagnatori` (deleted and re-inserted on each RSVP update), `regali`.
- Schema lives in `supabase/schema.sql`; must be applied manually in Supabase SQL Editor.

### Email

`/api/regalo/route.ts` sends transactional email via **Resend** using the `RESEND_FROM` sender address. Bank details come from env vars, never hardcoded.

### Music

`MusicPlayer` (mounted in root layout, always present) loads the SoundCloud Widget API script lazily, initialises an off-screen iframe, and exposes a floating play/pause button (fixed bottom-right). The iframe must have real pixel dimensions — `display:none` or tiny sizes break the SC Widget.

### Color system

Defined in `app/globals.css` via Tailwind v4 `@theme` block as CSS custom properties. Use Tailwind utilities `bg-night`, `text-sunset`, etc. — **never hardcode hex values** in components.

| Token      | Hex       | Usage                        |
|------------|-----------|------------------------------|
| `night`    | `#193250` | Text, header, footer         |
| `dust`     | `#767293` | Secondary text, borders      |
| `lilac`    | `#E2CBE1` | Backgrounds, card borders    |
| `sunset`   | `#E6A67D` | Accent, buttons, CTA         |
| `pale`     | `#F6FEAA` | Page background, highlights  |

### Shared constants

`lib/constants.ts` holds `greetGuest(name)` (gender-neutral greeting), `WEDDING_DATE`, `WEDDING_LOCATION`, `WEDDING_MAPS_URL`. Always update here, not in individual pages.

## Environment variables

Required in `.env` (never commit this file):

```
SITE_PASSWORD=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM=
WEDDING_IBAN=
WEDDING_INTESTATARIO=
WEDDING_CAUSALE_PREFIX=
ADMIN_USER_1=
ADMIN_EMAIL_1=
ADMIN_USER_2=
ADMIN_EMAIL_2=
ADMIN_PASSWORD=
```

`NEXT_PUBLIC_*` variables are safe to expose to the browser. All others are server-only.
