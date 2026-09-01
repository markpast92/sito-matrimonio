# Sito matrimonio Marco & Cristina

Sito web per il matrimonio del **10 settembre 2027** a **Costa Ponente**.
Fatto con Next.js, Tailwind, Supabase e Resend. Ospitato su Vercel (piano gratuito).

---

## Avvio in locale

```bash
npm install
npm run dev
# apri http://localhost:3000
```

Inserisci la password dal file `.env` (`SITE_PASSWORD`).

---

## Come è fatto — architettura in breve

Il sito è una **single-page app con 5 sezioni**: password → home → RSVP → regalo → musica.
C'è anche una **dashboard admin** raggiungibile su `/admin`.

```
Browser (ospite)
    │
    ▼
middleware.ts          ← controlla se l'ospite ha già inserito la password
    │                     se no → reindirizza a /password
    ▼
app/ (le pagine)       ← quello che vede l'utente (React, Tailwind)
    │
    ▼
app/api/ (le API)      ← codice che gira sul server (invisibile all'utente)
    │
    ├── Supabase        ← database (RSVP, regali)
    └── Resend          ← email (coordinate bancarie)
```

**Regola principale**: tutto quello che riguarda il database e le email avviene nelle
API routes (cartella `app/api/`), mai direttamente nelle pagine. Le pagine mandano
una richiesta all'API, l'API fa il lavoro "pericoloso" (Supabase, Resend) sul server
dove le chiavi segrete non sono visibili all'utente.

---

## Ruolo di ogni file

### Configurazione
| File | Cosa fa |
|------|---------|
| `.env` | Tutte le chiavi segrete (password, Supabase, Resend, IBAN). **Non va su GitHub.** |
| `.env.example` | Stesso schema del `.env` ma senza valori — documentazione pubblica |
| `middleware.ts` | Legge il cookie di sessione e decide se far passare l'utente o no |
| `next.config.ts` | Configurazione Next.js (attualmente vuota, pronta per estensioni) |
| `tailwind.config.ts` | Non esiste — in Tailwind v4 i colori sono in `app/globals.css` |
| `supabase/schema.sql` | SQL da incollare in Supabase per creare le tabelle |

### Stili e tema
| File | Cosa fa |
|------|---------|
| `app/globals.css` | **Font di base, colori del tema, dimensione testo globale.** Modifica qui. |
| `app/layout.tsx` | Layout radice: carica il font Google (Lora), applica la classe body |

### Pagine (quello che vede l'utente)
| File | Sezione |
|------|---------|
| `app/page.tsx` | Home — carica `HomeClient` |
| `app/password/page.tsx` | Pagina di accesso con la password |
| `app/rsvp/page.tsx` | Form conferma presenza |
| `app/regalo/page.tsx` | Form regalo di nozze |
| `app/musica/page.tsx` | Player Spotify |
| `app/admin/page.tsx` | Dashboard admin (tabelle RSVP e regali) |
| `app/admin/login/page.tsx` | Login admin |

### Componenti riutilizzabili
| File | Cosa fa |
|------|---------|
| `components/Nav.tsx` | Barra di navigazione in cima a ogni pagina |
| `components/HomeClient.tsx` | Home page interattiva: overlay nome alla prima visita, saluto, bottoni |

### Dati e logica condivisa
| File | Cosa fa |
|------|---------|
| `lib/constants.ts` | Data e location del matrimonio, formula del saluto — **modifica qui** |
| `lib/supabase.ts` | Crea il client Supabase (usato solo nelle API) |

### API routes (codice server — non visibile all'utente)
| File | Cosa fa |
|------|---------|
| `app/api/auth/route.ts` | Verifica la password degli ospiti, imposta il cookie |
| `app/api/rsvp/route.ts` | Salva (o aggiorna) un RSVP su Supabase |
| `app/api/regalo/route.ts` | Invia l'email con IBAN via Resend, salva su Supabase |
| `app/api/admin-auth/route.ts` | Login admin — verifica username e password |
| `app/api/admin-logout/route.ts` | Cancella il cookie admin e reindirizza |

---

## Guida per chi fa solo frontend

### Cambiare i colori

Tutto il tema è in **`app/globals.css`**, nel blocco `@theme`:

```css
@theme {
  --color-night:  #193250;   /* blu notte — testo principale, header, footer */
  --color-dust:   #767293;   /* viola polvere — testi secondari, placeholder */
  --color-lilac:  #E2CBE1;   /* lilla chiaro — sfondi sezione, card, bordi */
  --color-sunset: #E6A67D;   /* arancio tramonto — bottoni, accenti */
  --color-pale:   #F6FEAA;   /* giallo pallido — sfondo pagina */
}
```

Cambia i valori esadecimali e il colore si aggiorna ovunque nel sito.
Nei componenti i colori si usano come classi Tailwind: `bg-sunset`, `text-night`, `border-lilac`, ecc.

> Verifica sempre che il contrasto testo/sfondo sia leggibile (standard AA):
> usa [https://webaim.org/resources/contrastchecker/](https://webaim.org/resources/contrastchecker/)

### Cambiare il font

Il font è impostato in **`app/layout.tsx`**:

```typescript
import { Lora } from 'next/font/google'
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' })
```

Per cambiarlo: sostituisci `Lora` con qualsiasi font di [Google Fonts](https://fonts.google.com/).
Esempio con Playfair Display:
```typescript
import { Playfair_Display } from 'next/font/google'
const font = Playfair_Display({ subsets: ['latin'], variable: '--font-lora', display: 'swap' })
```
Tieni lo stesso nome di variabile (`--font-lora`) e non devi toccare altro.

### Cambiare le dimensioni del testo

La dimensione base è in **`app/globals.css`**:

```css
body {
  font-size: 1.125rem;   /* equivale a 18px — grande per utenti anziani */
  line-height: 1.75rem;
}
```

Nei componenti, le classi Tailwind `text-xl`, `text-2xl`, `text-4xl` ecc. sono
relative a questa base. Per rendere tutto più grande o più piccolo, basta cambiare
`font-size` qui.

### Cambiare i testi delle pagine

Ogni sezione ha il suo file. Apri il file, cerca il testo da cambiare e modificalo.
Non toccare le parti con `className=`, `onClick=`, `useState` ecc. — sono la logica.

| Cosa cambiare | Dove |
|---|---|
| Saluto personalizzato (`"Che bello averti con noi, ..."`) | `lib/constants.ts` → `greetGuest` |
| Data e location del matrimonio | `lib/constants.ts` → `WEDDING_DATE`, `WEDDING_LOCATION` |
| Link Google Maps | `lib/constants.ts` → `WEDDING_MAPS_URL` |
| Testo intro home | `components/HomeClient.tsx` → il `<p>` con `text-dust` a metà file |
| Testo bottoni home | `components/HomeClient.tsx` → i due `<Link>` in fondo |
| Testo guida RSVP | `app/rsvp/page.tsx` → il `<p>` dopo `<h1>` |
| Messaggio conferma RSVP | `app/rsvp/page.tsx` → blocco `if (submitted)` |
| Testo spiegazione regalo | `app/regalo/page.tsx` → il `<div className="bg-lilac...">` |
| Testo email regalo (mittente/corpo) | `app/api/regalo/route.ts` → `html:` nella chiamata Resend |
| Avviso volume musica | `app/musica/page.tsx` → blocco `<div className="bg-sunset...">` |

### Cambiare la navigazione

**`components/Nav.tsx`** — array `links` in cima al file:

```typescript
const links = [
  { href: '/', label: 'Home' },
  { href: '/rsvp', label: 'Conferma presenza' },
  { href: '/regalo', label: 'Regalo' },
  { href: '/musica', label: 'Musica' },
]
```

Cambia i `label` per rinominare le voci. Non cambiare gli `href` se non sai cosa fai.

### Cambiare la palette di un singolo elemento

Le classi Tailwind si leggono così: `bg-sunset` = sfondo arancio, `text-night` = testo blu,
`border-lilac` = bordo lilla, `rounded-2xl` = angoli arrotondati, `p-6` = padding.

Esempio — rendere un bottone di colore diverso:
```tsx
// Prima
<button className="bg-sunset text-white ...">

// Dopo (usa un altro colore del tema)
<button className="bg-night text-white ...">
```

---

## Variabili d'ambiente (`.env`)

```
SITE_PASSWORD          password che gli ospiti inseriscono per entrare
NEXT_PUBLIC_SUPABASE_URL          URL del progetto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY     chiave pubblica Supabase
SUPABASE_SERVICE_ROLE_KEY         chiave privata Supabase (solo server)
RESEND_API_KEY                    chiave API Resend per le email
RESEND_FROM                       indirizzo mittente email
WEDDING_IBAN                      IBAN per i bonifici regalo
WEDDING_INTESTATARIO              intestatario del conto
WEDDING_CAUSALE_PREFIX            inizio della causale ("Regalo matrimonio...")
NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID   ID della playlist Spotify (parte finale dell'URL)
ADMIN_USER_1 / ADMIN_USER_2       username admin
ADMIN_PASSWORD                    password admin
NODE_TLS_REJECT_UNAUTHORIZED=0    solo in locale se la rete ha SSL inspection
```

---

## Database (Supabase)

Esegui `supabase/schema.sql` una volta sola nella SQL Editor di Supabase.
Crea tre tabelle: `rsvp`, `rsvp_accompagnatori`, `regali`.

---

## Fasi completate / da fare

- [x] Fase 1 — Scaffold
- [x] Fase 2 — Home page
- [x] Fase 3 — RSVP
- [x] Fase 4 — Regalo
- [x] Fase 5 — Musica
- [x] Fase 8 — Dashboard admin
- [ ] Fase 6 — QR code e distribuzione
- [ ] Fase 7 — Deploy Vercel
