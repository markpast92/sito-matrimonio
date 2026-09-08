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

Il sito ha 5 sezioni: password → home → RSVP → regalo → musica.
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

### Flusso di autenticazione

C'è **un solo punto di accesso**: `/password`.
- Password ospiti (`SITE_PASSWORD`) → cookie `site_auth=ok` → home
- Password sposi (`ADMIN_PASSWORD`) → cookie `site_auth=ok` + `admin_auth=ok` → dashboard
- "Esci" dalla dashboard cancella entrambi i cookie e torna a `/password`
- Un ospite non può mai raggiungere `/admin` anche conoscendo l'URL

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
| `app/globals.css` | Font di base, colori del tema, dimensione testo globale. Modifica qui. |
| `app/layout.tsx` | Layout radice: carica i font Google, monta MusicPlayer |
| `app/icon.png` | Favicon del sito |

### Pagine
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
| `components/Nav.tsx` | Barra di navigazione. Prop `simple` per la dashboard admin |
| `components/HomeClient.tsx` | Home page interattiva: overlay nome, saluto, mappa, bottoni |
| `components/MusicPlayer.tsx` | Player floating SoundCloud: icona speaker fissa in basso a destra |

### Dati e logica condivisa
| File | Cosa fa |
|------|---------|
| `lib/constants.ts` | Data, location, URL venue e Google Maps, formula del saluto — modifica qui |
| `lib/supabase.ts` | Crea il client Supabase (usato solo nelle API) |

### API routes (codice server)
| File | Cosa fa |
|------|---------|
| `app/api/auth/route.ts` | Login: verifica password ospite o admin, imposta i cookie |
| `app/api/logout/route.ts` | Cancella tutti i cookie e reindirizza a `/password` |
| `app/api/rsvp/route.ts` | Salva o aggiorna un RSVP su Supabase |
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

Verifica sempre che il contrasto testo/sfondo sia leggibile (standard AA) con [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

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

Sostituisci `app/icon.png` e `public/icon.png` con la tua immagine.

---

## Variabili d'ambiente (`.env`)

Il file `.env` non va mai su GitHub. Va creato manualmente in locale e le stesse variabili vanno inserite su Vercel (Settings → Environment Variables).

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

## Deploy su Vercel

Il sito è ospitato su [Vercel](https://vercel.com) piano Hobby (gratuito).

### Primo deploy

1. Vai su [vercel.com](https://vercel.com) → **Add New → Project**
2. Importa il repository GitHub `sito-matrimonio`
3. Vercel rileva Next.js automaticamente — non toccare nulla nel form
4. Espandi **Environment Variables** e inserisci tutte le variabili del `.env` (esclusa `NODE_TLS_REJECT_UNAUTHORIZED`, quella è solo per sviluppo locale)
5. Clicca **Deploy**

Il sito sarà disponibile su `sito-matrimonio-xxxx.vercel.app`.

### Deploy continuo (CI/CD)

Ogni `git push` su `main` trigghera automaticamente un nuovo deploy su Vercel. Non serve fare nulla di manuale.

### Aggiornare una variabile d'ambiente

Vercel → Settings → Environment Variables → modifica il valore → fai un nuovo deploy (o aspetta il prossimo push).

---

## Keep-alive Supabase

Il piano free di Supabase mette in pausa i progetti dopo 7 giorni di inattività.
Il workflow `.github/workflows/keep-alive.yml` fa un ping ogni 5 giorni, così il progetto non va mai in pausa.

Richiede due secret nella repository GitHub (Settings → Secrets and variables → Actions):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
