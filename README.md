# Sito matrimonio Marco & Cristina

Sito web privato per il matrimonio del **10 settembre 2027** a **Costa Ponente**, Mondello (Palermo).

Gli invitati entrano con una password condivisa, confermano la presenza (RSVP) e possono
richiedere via email le coordinate per il regalo di nozze. Marco e Cristina hanno una
dashboard riservata con il riepilogo di risposte e regali.

## Funzionalità

- **Accesso protetto** con password unica per gli ospiti (una password separata per l'area admin).
- **Home** con saluto personalizzato, countdown al giorno del matrimonio, programma della giornata, mappa della location e domande frequenti.
- **RSVP**: conferma presenza con gestione degli accompagnatori, preferenze alimentari facoltative (vegano, vegetariano, ecc.), allergie e menu bambino. Ogni ospite può modificare la propria risposta.
- **Regalo di nozze**: l'ospite lascia email e cifra, riceve via email le coordinate per il bonifico (nessun pagamento online).
- **Musica**: player SoundCloud flottante per far partire la playlist durante l'evento.
- **Dashboard admin** (`/admin`): tabelle con RSVP, accompagnatori, menu/allergie e regali ricevuti, più i totali.

## Stack tecnologico

| Ambito | Tecnologia |
|--------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) + TypeScript |
| Stili | [Tailwind CSS v4](https://tailwindcss.com/) |
| Database | [Supabase](https://supabase.com/) (Postgres, piano free) |
| Email | [Resend](https://resend.com/) (email transazionali) |
| Hosting | [Vercel](https://vercel.com/) (piano Hobby) |

## Avvio in locale

Serve [Node.js](https://nodejs.org/) 18+ e un file `.env` con le variabili elencate sotto.

```bash
npm install
npm run dev        # avvia il server di sviluppo su http://localhost:3000
```

Altri comandi:

```bash
npm run build      # build di produzione (valida anche i tipi TypeScript)
npm run start      # serve la build di produzione
```

All'apertura viene chiesta una password: usa `SITE_PASSWORD` (ospiti) o `ADMIN_PASSWORD` (dashboard), presi dal tuo `.env`.

## Come funziona

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

### Autenticazione

C'è **un solo punto di accesso**: la pagina `/password`. La stessa API (`/api/auth`) gestisce entrambi i casi:

- Password ospiti (`SITE_PASSWORD`) → cookie `site_auth=ok` (30 giorni) → home
- Password sposi (`ADMIN_PASSWORD`) → cookie `site_auth=ok` + `admin_auth=ok` → dashboard
- "Esci" cancella entrambi i cookie e riporta a `/password`
- Un ospite non può mai raggiungere `/admin` anche conoscendo l'URL: `middleware.ts` lo rimanda sempre a `/password`

Il nome dell'ospite viene chiesto una volta alla prima visita e salvato nel browser (`localStorage`), così i moduli si precompilano da soli.

## Struttura del progetto

### Configurazione
| File | Cosa fa |
|------|---------|
| `.env` | Chiavi segrete (password, Supabase, Resend, IBAN). **Non va su GitHub.** |
| `middleware.ts` | Legge i cookie di sessione e decide se far passare l'utente |
| `next.config.ts` | Configurazione Next.js |
| `supabase/schema.sql` | SQL da eseguire in Supabase per creare le tabelle |

### Pagine (`app/`)
| File | Sezione |
|------|---------|
| `app/layout.tsx` | Layout radice: carica i font Google, monta il MusicPlayer |
| `app/globals.css` | Tema (colori, font, variabili del logo), stili globali |
| `app/page.tsx` | Home — carica `HomeClient` |
| `app/password/page.tsx` | Unica pagina di accesso (ospiti e sposi) |
| `app/rsvp/page.tsx` | Conferma presenza — usa `RsvpSection` |
| `app/regalo/page.tsx` | Modulo regalo di nozze |
| `app/musica/page.tsx` | Pagina musica |
| `app/admin/page.tsx` | Dashboard admin (tabelle RSVP e regali) |

### Componenti (`components/`)
| File | Cosa fa |
|------|---------|
| `Nav.tsx` | Navigazione a drawer (overlay). Prop `simple` per la barra admin |
| `HomeClient.tsx` | Home interattiva: nome, saluto, countdown, programma, mappa, FAQ |
| `RsvpSection.tsx` | Modulo RSVP: presenza, accompagnatori, menu/preferenze/allergie |
| `MusicPlayer.tsx` | Player flottante SoundCloud (nascosto sulla pagina di login) |
| `admin/RsvpTable.tsx`, `admin/RegaliTable.tsx` | Tabelle della dashboard |

### Dati e logica condivisa (`lib/`)
| File | Cosa fa |
|------|---------|
| `lib/constants.ts` | Data, orario, location, link venue/mappe, saluto, programma — **modifica qui** |
| `lib/supabase.ts` | Crea i client Supabase (usati solo nelle API) |

### API (`app/api/`, codice server)
| File | Cosa fa |
|------|---------|
| `auth/route.ts` | Login: verifica la password ospite o admin e imposta i cookie |
| `logout/route.ts` | Cancella i cookie e reindirizza a `/password` |
| `rsvp/route.ts` | Salva o aggiorna un RSVP su Supabase |
| `rsvp/status/route.ts` | Controlla se un nome è già registrato (ospite o accompagnatore) |
| `regalo/route.ts` | Invia l'email con l'IBAN via Resend e salva la richiesta su Supabase |

## Variabili d'ambiente (`.env`)

Il file `.env` non va mai su GitHub. Va creato in locale e le stesse variabili vanno inserite su Vercel (Settings → Environment Variables). Le variabili `NEXT_PUBLIC_*` sono esposte al browser; tutte le altre sono solo lato server.

```
SITE_PASSWORD                     password che gli ospiti inseriscono per entrare
ADMIN_PASSWORD                    password di Marco e Cristina per la dashboard
NEXT_PUBLIC_SUPABASE_URL          URL del progetto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY     chiave pubblica Supabase
SUPABASE_SERVICE_ROLE_KEY         chiave privata Supabase (solo server)
RESEND_API_KEY                    chiave API Resend per le email
RESEND_FROM                       indirizzo mittente delle email
WEDDING_IBAN                      IBAN per i bonifici regalo
WEDDING_INTESTATARIO              intestatario del conto
WEDDING_CAUSALE_PREFIX            inizio della causale ("Regalo matrimonio...")
```

## Database (Supabase)

Esegui `supabase/schema.sql` **una volta sola** nella SQL Editor di Supabase.
Crea tre tabelle:

- `rsvp` — una riga per ospite principale (chiave `nome,cognome`, upsert a ogni salvataggio)
- `rsvp_accompagnatori` — accompagnatori collegati a un RSVP (ricreati a ogni aggiornamento)
- `regali` — richieste di regalo (email, importo dichiarato, messaggio)

## Deploy su Vercel

Il sito è ospitato su Vercel (piano Hobby, gratuito).

**Primo deploy:**

1. Su [vercel.com](https://vercel.com) → **Add New → Project**
2. Importa il repository GitHub `sito-matrimonio`
3. Vercel rileva Next.js automaticamente — non serve toccare il form
4. Espandi **Environment Variables** e inserisci tutte le variabili del `.env`
5. Clicca **Deploy**

**Deploy continuo:** ogni `git push` su `main` fa partire automaticamente un nuovo deploy.

**Aggiornare una variabile:** Settings → Environment Variables → modifica → nuovo deploy (o attendi il prossimo push).

## Keep-alive Supabase

Il piano free di Supabase mette in pausa i progetti dopo 7 giorni di inattività.
Il workflow `.github/workflows/keep-alive.yml` fa un ping ogni 5 giorni per tenerlo attivo.

Richiede due secret nella repository GitHub (Settings → Secrets and variables → Actions):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
