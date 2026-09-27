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

### Auth flow (single login)

`middleware.ts` intercepts every request (except `_next/static`, `_next/image`, `favicon.ico`):

1. **Guest gate** - checks `site_auth=ok` cookie. Missing → redirect to `/password`.
2. **Admin gate** - `/admin/*` additionally requires `admin_auth=ok` cookie.

There is **one login page only**: `/password`. `/api/auth` handles both cases:
- `SITE_PASSWORD` → sets `site_auth=ok` (30 days), redirects to `/`
- `ADMIN_PASSWORD` → sets both `site_auth=ok` and `admin_auth=ok`, redirects to `/admin`

Logout (`/api/logout`) deletes both cookies and redirects to `/password`. Guests can never reach `/admin` even if they know the URL - the middleware always sends them back to `/password`.

`Nav` accepts a `simple` boolean prop: when true (used in the admin page) it renders only the M&C logo and the Esci button, hiding all guest navigation links.

### Navigation (`components/Nav.tsx`)

The full nav is a **fixed overlay drawer** used at every breakpoint (mobile + desktop), not an in-flow dropdown. A sticky top bar (`h-16`) holds only the hamburger and the logout icon; opening slides in a left drawer over a backdrop and locks body scroll. Keeping the drawer `fixed` (out of document flow) is deliberate: the old in-flow mobile dropdown grew the sticky nav and shifted the page, which threw off hash-anchor scrolling (clicking "Dove" landed on "Quando"). For in-page links, `handleLinkClick` closes the drawer and does a manual `scrollIntoView` after an 80ms tick; home sections carry `scroll-mt-20` and `html` has `scroll-padding-top: 5rem` to offset the sticky bar.

Guest name is collected once in `HomeClient` and stored in `localStorage` as `guest_name` / `guest_surname`. Pages pre-fill forms from localStorage on mount.

### RSVP form (`components/RsvpSection.tsx`)

The menu model is **"standard by default, opt-in extras"**: everyone gets the full menu unless they add something. Two collapsibles (`Collapsible`) hold optional radio preferences (`vegano` / `vegetariano` / `non mangio carne` / `non mangio pesce`) and a free-text allergie field — both start closed and auto-open when a value is present (editing an existing RSVP). Accompagnatori additionally have an **"È un bambino/a"** checkbox that swaps the preference radios for `Menu bambino` / `Senza menu`.

The DB `menu` column stores a **human-readable string** (`standard`, `vegano`, `non mangio carne`, `menu bambino`, `senza menu`, …). `ospiteToMenu` serialises the form state to that string, `parseMenu` reverses it for editing, and `menuDisplay` formats it for the summary and admin views. The `/api/rsvp` route now stores `menu` verbatim (no more `altro:` special-casing).

### Data layer

- `lib/supabase.ts` exports two factory functions: `supabaseAnon()` (public key, safe in client bundles) and `supabaseAdmin()` (service role key, **only use in API routes**).
- Database tables: `rsvp` (upserted on `nome,cognome`), `rsvp_accompagnatori` (deleted and re-inserted on each RSVP update), `regali`.
- Schema lives in `supabase/schema.sql`; must be applied manually in Supabase SQL Editor.

### Email

`/api/regalo/route.ts` sends transactional email via **Resend** using the `RESEND_FROM` sender address. Bank details come from env vars, never hardcoded.

### Music

`MusicPlayer` (mounted in root layout, always present) loads the SoundCloud Widget API script lazily, initialises an off-screen iframe, and exposes a floating play/pause button (fixed bottom-right). The iframe must have real pixel dimensions - `display:none` or tiny sizes break the SC Widget. It returns `null` on `/password` (via `usePathname`) so the login screen has no music button.

### Color system

Defined in `app/globals.css` via Tailwind v4 `@theme` block as CSS custom properties. Use Tailwind utilities `bg-night`, `text-sunset`, etc. - **never hardcode hex values** in components.

| Token      | Hex       | Usage                        |
|------------|-----------|------------------------------|
| `night`    | `#193250` | Text, header, footer         |
| `dust`     | `#767293` | Secondary text, borders      |
| `lilac`    | `#E2CBE1` | Backgrounds, card borders    |
| `sunset`   | `#E6A67D` | Accent, buttons, CTA         |
| `pale`     | `#F6FEAA` | Page background, highlights  |
| `error`    | `#b0432c` | Form/validation errors (warm terracotta, AA on white). Use `text-error` — never `text-red-*` |

### Logo (fichi d'India)

The logo appears as a large illustration on the login/entry screens and as a small circle in the nav (admin bar + drawer header). All sizing/zoom is driven by CSS custom properties in `:root` (`app/globals.css`), so it can be tuned live from DevTools and changed in one place:

- `--fico-circle-size` — diameter of the circle logo
- `--fico-circle-zoom` — zoom of the image inside the circle (`.fico-circle`, `object-cover`)
- `--fico-hero-zoom` — zoom of the big login image inside its fixed box (`.fico-hero`, clipped via `overflow:hidden` so the reserved rectangle never changes)

The circle uses `/fico-dindia-icon.jpg`; the large hero uses the transparent `/fico-dindia.png`.

### Shared constants

`lib/constants.ts` holds `greetGuest(name)` (gender-neutral greeting), `WEDDING_DATE`, `WEDDING_TIME`, `WEDDING_LOCATION`, `WEDDING_VENUE_URL` (venue website), `WEDDING_MAPS_URL` (Google Maps pin), `WEDDING_DATETIME_UTC` (for the countdown) and `PROGRAM`. Always update here, not in individual pages. `PROGRAM` items are `{ time, title, details?: string[], note? }` — `details` renders as a bulleted list inside a program step, `note` as an italic quote. Menu / preference labels shown to guests live in `RsvpSection.tsx`.

## Environment variables

Required in `.env` (never commit this file):

```
SITE_PASSWORD=
ADMIN_PASSWORD=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM=
WEDDING_IBAN=
WEDDING_INTESTATARIO=
WEDDING_CAUSALE_PREFIX=
```

`NEXT_PUBLIC_*` variables are safe to expose to the browser. All others are server-only.
