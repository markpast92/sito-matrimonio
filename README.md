# Sito matrimonio Marco & Cristina

Sito web per il matrimonio del **10 settembre 2027** a **Costa Ponente**, Mondello (Palermo).
Fatto con Next.js, Tailwind, Supabase e Resend. Ospitato su Vercel (piano gratuito).

---

## Avvio in locale

```bash
npm install
npm run dev
# apri http://localhost:3000
```

Inserisci la password dal file `.env` (`SITE_PASSWORD` per gli ospiti, `ADMIN_PASSWORD` per la dashboard).

---

## Come è fatto — architettura in breve

Il sito è una **single-page app con 5 sezioni**: password → home → RSVP → regalo → musica.
C'è anche una **dashboard admin** raggiungibile su `/admin`.

```
Browser (ospite o sposo)
    │
    ▼
middleware.ts          ← controlla i cookie di sessione
    │                     nessun cookie → /password
    │                     cookie ospite ma non admin → /password (non /admin)
    ▼
app/ (le pagine)       ← quello che vede l'utente (React, Tailwind)
    │
    ▼
app/api/ (le API)      ← codice che gira sul server (invisibile all'utente)
    │
    ├── Supabase        ← database (RSVP, regali)
    └── Resend          ← email (coordinate bancarie)
```

### Flusso di autenticazione (unico login)

C'è **un solo punto di accesso**: `/password`.
- Password ospiti (`SITE_PASSWORD`) → cookie `site_auth=ok` → home
- Password sposi (`ADMIN_PASSWORD`) → cookie `site_auth=ok` + `admin_auth=ok` → dashboard
- "Esci" dalla dashboard cancella entrambi i cookie e torna a `/password`
- Un ospite non può mai raggiungere `/admin` anche conoscendo l'URL

**Regola principale**: tutto quello che riguarda il database e le email avviene nelle
API routes (cartella `app/api/`), mai direttamente nelle pagine.

---

## Ruolo di ogni file

### Configurazione
| File | Cosa fa |
|------|---------|
| `.env` | Tutte le chiavi segrete (password, Supabase, Resend, IBAN). **Non va su GitHub.** |
| `middleware.ts` | Legge i cookie di sessione e decide se far passare l'utente o no |
| `next.config.ts` | Configurazione Next.js |
| `supabase/schema.sql` | SQL da incollare in Supabase per creare le tabelle |

### Stili e tema
| File | Cosa fa |
|------|---------|
| `app/globals.css` | **Font di base, colori del tema, dimensione testo globale.** Modifica qui. |
| `app/layout.tsx` | Layout radice: carica i font Google, monta MusicPlayer |
| `app/icon.png` | Favicon del sito (rilevata automaticamente da Next.js) |

### Pagine (quello che vede l'utente)
| File | Sezione |
|------|---------|
| `app/page.tsx` | Home — carica `HomeClient` |
| `app/password/page.tsx` | Unica pagina di accesso (ospiti e sposi) |
| `app/rsvp/page.tsx` | Form conferma presenza |
| `app/regalo/page.tsx` | Form regalo di nozze |
| `app/musica/page.tsx` | Pagina musica (avviso volume, istruzioni player) |
| `app/admin/page.tsx` | Dashboard admin (tabelle RSVP e regali) |

### Componenti riutilizzabili
| File | Cosa fa |
|------|---------|
| `components/Nav.tsx` | Barra di navigazione. Prop `simple` per la dashboard admin (solo M&C + Esci) |
| `components/HomeClient.tsx` | Home page interattiva: overlay nome alla prima visita, saluto, mappa location, bottoni |
| `components/MusicPlayer.tsx` | Player floating SoundCloud: icona speaker fissa in basso a destra |

### Dati e logica condivisa
| File | Cosa fa |
|------|---------|
| `lib/constants.ts` | Data, location, URL venue e Google Maps, formula del saluto — **modifica qui** |
| `lib/supabase.ts` | Crea il client Supabase (usato solo nelle API) |

### API routes (codice server — non visibile all'utente)
| File | Cosa fa |
|------|---------|
| `app/api/auth/route.ts` | Unico login: verifica password ospite o admin, imposta i cookie |
| `app/api/logout/route.ts` | Cancella tutti i cookie e reindirizza a `/password` |
| `app/api/admin-logout/route.ts` | Alias di logout per la dashboard (stesso comportamento) |
| `app/api/rsvp/route.ts` | Salva (o aggiorna) un RSVP su Supabase |
| `app/api/regalo/route.ts` | Invia l'email con IBAN via Resend, salva su Supabase |

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

### Cambiare i testi delle pagine

| Cosa cambiare | Dove |
|---|---|
| Saluto personalizzato | `lib/constants.ts` → `greetGuest` |
| Data del matrimonio | `lib/constants.ts` → `WEDDING_DATE` |
| Nome della location | `lib/constants.ts` → `WEDDING_LOCATION` |
| Link sito della location | `lib/constants.ts` → `WEDDING_VENUE_URL` |
| Link Google Maps | `lib/constants.ts` → `WEDDING_MAPS_URL` |
| Testo intro home | `components/HomeClient.tsx` |
| Testo guida RSVP | `app/rsvp/page.tsx` |
| Testo spiegazione regalo | `app/regalo/page.tsx` |
| Testo email regalo | `app/api/regalo/route.ts` → `html:` nella chiamata Resend |

### Favicon

Sostituisci `app/icon.png` con la tua immagine. Next.js la rileva automaticamente.

---

## Variabili d'ambiente (`.env`)

```
SITE_PASSWORD                     password che gli ospiti inseriscono per entrare
ADMIN_PASSWORD                    password di Marco e Cristina per la dashboard
NEXT_PUBLIC_SUPABASE_URL          URL del progetto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY     chiave pubblica Supabase
SUPABASE_SERVICE_ROLE_KEY         chiave privata Supabase (solo server)
RESEND_API_KEY                    chiave API Resend per le email
RESEND_FROM                       indirizzo mittente email
WEDDING_IBAN                      IBAN per i bonifici regalo
WEDDING_INTESTATARIO              intestatario del conto
WEDDING_CAUSALE_PREFIX            inizio della causale ("Regalo matrimonio...")
```

---

## Database (Supabase)

Esegui `supabase/schema.sql` una volta sola nella SQL Editor di Supabase.
Crea tre tabelle: `rsvp`, `rsvp_accompagnatori`, `regali`.

---

## Fasi completate / da fare

- [x] Fase 1 — Scaffold
- [x] Fase 2 — Home page con mappa location
- [x] Fase 3 — RSVP
- [x] Fase 4 — Regalo
- [x] Fase 5 — Musica (SoundCloud floating player)
- [x] Fase 8 — Dashboard admin
- [x] Auth unificata — unico login per ospiti e sposi
- [ ] Fase 6 — QR code e distribuzione
- [ ] Fase 7 — Deploy Vercel
- [ ] Anti-duplicato RSVP — popup se nome+cognome già registrato (ospite principale o accompagnatore)
