# Sito matrimonio Marco & Cristina

Sito web personale per il matrimonio del 10 settembre 2027 a Costa Ponente.
Stack: Next.js 15 · Tailwind 4 · Supabase · Resend.

## Avvio in locale

```bash
npm install
npm run dev
# apri http://localhost:3000
```

La prima volta inserisci la password dal file `.env` (`SITE_PASSWORD`).

## Variabili d'ambiente

Copia `.env.example` in `.env` e compila tutti i valori.
Il file `.env` non viene mai committato su GitHub.

## Database Supabase

Prima di usare RSVP e Regalo, esegui una volta lo schema:

1. Vai su [supabase.com/dashboard](https://supabase.com/dashboard) → il tuo progetto → **SQL Editor**
2. Incolla e lancia il contenuto di `supabase/schema.sql`

---

## Come modificare le sezioni

### Home page
**File:** `components/HomeClient.tsx`

- **Testo di benvenuto / guida breve:** modifica il paragrafo `<p className="text-dust...">` a metà file
- **Testo dei bottoni:** cambia le label dentro i due `<Link>` in fondo al componente
- **Saluto personalizzato:** la formula è in `lib/constants.ts` → funzione `greetGuest`
- **Data e location:** `lib/constants.ts` → costanti `WEDDING_DATE`, `WEDDING_LOCATION`, `WEDDING_MAPS_URL`

### Pagina password
**File:** `app/password/page.tsx`

- **Testo sotto il titolo:** modifica il `<p>` con `Inserisci la password che ti abbiamo inviato`
- **Password effettiva:** nel file `.env` → `SITE_PASSWORD`

### RSVP
**File:** `app/rsvp/page.tsx`

- **Testo guida in cima:** modifica il `<p className="text-dust...">` dopo il titolo
- **Opzioni menu:** array `MENU` in cima al file — aggiungi o rimuovi voci
- **Messaggio di conferma:** cerca `submitted` → modifica il testo nel blocco `if (submitted)`

Il form salva su Supabase (tabelle `rsvp` + `rsvp_accompagnatori`).

### Regalo di nozze
**File:** `app/regalo/page.tsx`

- **Testo spiegazione (riquadro lilla):** `<div className="bg-lilac...">` — spiega il meccanismo del bonifico
- **Testo bottone invio:** `<button>Invia — riceverai una email</button>`
- **Messaggio di conferma:** blocco `if (submitted)`

**File:** `app/api/regalo/route.ts`

- **Template email:** blocco `html:` nella chiamata `resend.emails.send(...)` — modifica testo e grafica
- **Oggetto email:** `subject:` nella stessa chiamata
- **Dati bancari:** vengono in automatico dal `.env` (`WEDDING_IBAN`, `WEDDING_INTESTATARIO`, `WEDDING_CAUSALE_PREFIX`)

### Musica
**File:** `app/musica/page.tsx`

- **ID playlist Spotify:** aggiungi `NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID=<id>` nel `.env`
  L'ID è la parte finale dell'URL della playlist: `https://open.spotify.com/playlist/**37i9dQZF1DX4...**`
- **Testo avviso volume:** modifica il blocco `<div className="bg-sunset...">` in cima

### Dashboard admin
**File:** `app/admin/page.tsx`

Accedi su `/admin` con username `marco.pastorello` o `cristina.dallolio` e la password admin.
Mostra tutti gli RSVP con menu e allergie, e tutte le richieste regalo con totale.
Le credenziali sono in `.env` → `ADMIN_USER_1`, `ADMIN_USER_2`, `ADMIN_PASSWORD`.

---

## Struttura file principali

```
app/
  page.tsx                  # home page
  password/page.tsx         # gate password ospiti
  rsvp/page.tsx             # form conferma presenza
  regalo/page.tsx           # form regalo di nozze
  musica/page.tsx           # player Spotify
  admin/
    page.tsx                # dashboard riepilogo (server component)
    login/page.tsx          # login admin
  api/
    auth/route.ts           # verifica password ospiti
    rsvp/route.ts           # salva RSVP su Supabase
    regalo/route.ts         # invia email Resend + salva su Supabase
    admin-auth/route.ts     # login admin
    admin-logout/route.ts   # logout admin
components/
  Nav.tsx                   # barra navigazione
  HomeClient.tsx            # home page interattiva
lib/
  constants.ts              # data, location, saluto — modifica qui
  supabase.ts               # client Supabase (anon + admin)
middleware.ts               # gate password ospiti e gate admin
supabase/schema.sql         # SQL per creare le tabelle su Supabase
```
