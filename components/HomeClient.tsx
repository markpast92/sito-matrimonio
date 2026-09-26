'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import {
  greetGuest,
  WEDDING_DATE,
  WEDDING_TIME,
  WEDDING_LOCATION,
  WEDDING_VENUE_URL,
  WEDDING_MAPS_URL,
  WEDDING_DATETIME_UTC,
  PROGRAM,
} from '@/lib/constants'

// ── Countdown ─────────────────────────────────────────────────────────────────

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(() => Math.max(0, target.getTime() - Date.now()))
  useEffect(() => {
    const id = setInterval(() => setDiff(Math.max(0, target.getTime() - Date.now())), 1000)
    return () => clearInterval(id)
  }, [target])
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
    done:    diff === 0,
  }
}

function CountdownDisplay() {
  const { days, hours, minutes, seconds, done } = useCountdown(WEDDING_DATETIME_UTC)
  if (done) return (
    <p className="font-[family-name:var(--font-lora)] text-night text-xl italic mt-6">E il giorno è arrivato!</p>
  )
  const units = [
    { value: days,    label: 'giorni' },
    { value: hours,   label: 'ore' },
    { value: minutes, label: 'minuti' },
    { value: seconds, label: 'secondi' },
  ]
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-xs mx-auto mt-6 mb-2">
      {units.map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center bg-white/70 backdrop-blur-sm rounded-xl py-3 px-1">
          <span className="font-[family-name:var(--font-lora)] text-2xl sm:text-3xl font-bold text-night leading-none">
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.12em] text-night/60 font-[family-name:var(--font-inter)] mt-1">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Divisore tra sezioni ────────────────────────────────────────────────────

function SectionDivider() {
  return (
    <div className="w-full max-w-md sm:max-w-xl mx-auto flex items-center gap-3 px-5" aria-hidden="true">
      <span className="h-px flex-1 bg-night/20" />
      <span className="w-2 h-2 rotate-45 rounded-[1px] bg-sunset/80 shrink-0" />
      <span className="h-px flex-1 bg-night/20" />
    </div>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const faqLink = (
  <Link href="/rsvp" className="text-sunset underline underline-offset-2 hover:opacity-80 transition-opacity font-semibold">
    Partecipo
  </Link>
)

const FAQ_ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "C'è parcheggio?",
    a: <p>Sì, è possibile parcheggiare direttamente dentro la riserva, gratuitamente, dichiarando di essere invitati al matrimonio.</p>,
  },
  {
    q: "Come comunico allergie o preferenze alimentari?",
    a: <p>Nella pagina {faqLink} trovi i campi per segnalare allergie e scegliere il menù.</p>,
  },
  {
    q: "Possono venire i bambini?",
    a: <p>Certo, tutti i figli sono invitati! È previsto un servizio di animazione.</p>,
  },
  {
    q: "Come segnalo un menù bambini?",
    a: <p>Nella pagina {faqLink} puoi inserire il bambino come accompagnatore e specificare le preferenze nel campo dedicato.</p>,
  },
  {
    q: "Come mi vesto?",
    a: <p>Si consiglia un abito da sera estivo, con coprispalle o giacca. Scarpe eleganti ma comode — si balla sul prato!</p>,
  },
  {
    q: "Come prenoto un taxi o un'auto?",
    a: <p>Informazioni in arrivo. Nel frattempo non esitare a contattarci direttamente!</p>,
  },
]

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-2">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="border border-night/20 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="w-full flex justify-between items-center px-5 py-4 text-left text-night font-semibold text-base hover:bg-night/5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-inset font-[family-name:var(--font-inter)]"
          >
            <span className="pr-4">{item.q}</span>
            <svg
              className={`w-5 h-5 shrink-0 transition-transform duration-200 text-sunset ${open === i ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-5 pb-5 pt-1 text-night/80 text-base leading-relaxed font-[family-name:var(--font-inter)] border-t border-night/10">
              {item.a}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tipi badge RSVP ───────────────────────────────────────────────────────────

type RsvpBadge = 'si' | 'no' | 'accompagnatore' | 'none' | null

// ── Componente principale ─────────────────────────────────────────────────────

export default function HomeClient() {
  const [name, setName] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', cognome: '' })
  const [ready, setReady] = useState(false)
  const [rsvpBadge, setRsvpBadge] = useState<RsvpBadge>(null)

  useEffect(() => {
    const saved = localStorage.getItem('guest_name')
    setName(saved && saved.trim() ? saved : null)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!name) return
    const cognome = localStorage.getItem('guest_surname') || ''
    if (!cognome) return
    fetch(`/api/rsvp/status?nome=${encodeURIComponent(name)}&cognome=${encodeURIComponent(cognome)}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'principale') setRsvpBadge(data.rsvp?.partecipa ? 'si' : 'no')
        else if (data.status === 'accompagnatore') setRsvpBadge('accompagnatore')
        else setRsvpBadge('none')
      })
      .catch(() => setRsvpBadge('none'))
  }, [name])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const n = form.nome.trim()
    if (!n) return
    localStorage.setItem('guest_name', n)
    localStorage.setItem('guest_surname', form.cognome.trim())
    setName(n)
  }

  if (!ready) return <div className="min-h-screen bg-white" />

  // ── Prima visita: raccolta nome ────────────────────────────────────────────
  if (!name) {
    return (
      <main className="min-h-screen bg-hero flex items-center justify-center p-5">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="mx-auto mb-6 w-52">
            <Image
              src="/fico-dindia.png"
              alt="Marco & Cristina — due fichi d'India vestiti da sposo e sposa"
              width={1000}
              height={707}
              className="w-full h-auto"
              priority
            />
          </div>

          <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl p-7">
            <h1 className="text-xl sm:text-2xl font-bold text-night text-center mb-1 font-[family-name:var(--font-lora)]">
              Marco &amp; Cristina
            </h1>
            <p className="text-night/60 text-center text-base mb-7 font-[family-name:var(--font-inter)]">
              Prima di entrare, come ti chiami?
            </p>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nome"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                className="border-2 border-night/60 rounded-xl px-4 py-3.5 text-lg text-night outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 transition-all placeholder:text-night/30 font-[family-name:var(--font-inter)]"
                autoFocus
                autoComplete="given-name"
              />
              <input
                type="text"
                placeholder="Cognome"
                value={form.cognome}
                onChange={e => setForm(f => ({ ...f, cognome: e.target.value }))}
                className="border-2 border-night/60 rounded-xl px-4 py-3.5 text-lg text-night outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 transition-all placeholder:text-night/30 font-[family-name:var(--font-inter)]"
                autoComplete="family-name"
              />
              <button
                type="submit"
                disabled={!form.nome.trim()}
                className="btn-sunset py-3.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]"
              >
                Entra
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  // ── Pagina principale ─────────────────────────────────────────────────────
  return (
    <>
      <Nav />

      {/* Sfondo unico per tutta la home: stesso gradiente arancio/bianco dell'hero */}
      <div className="bg-hero">
      {/* ── 1. HOME / INTRO ──────────────────────────────────────── */}
      <section id="home" className="px-5 pt-6 pb-12 sm:pt-8 sm:pb-16 text-center animate-fade-in">
        <div className="mx-auto mb-4 w-full max-w-xs sm:max-w-sm">
          <Image
            src="/fico-dindia.png"
            alt="Marco & Cristina — due fichi d'India vestiti da sposo e sposa"
            width={1000}
            height={707}
            className="w-full h-auto"
            priority
          />
        </div>

        <p className="text-night/60 text-sm sm:text-base tracking-[0.2em] uppercase font-[family-name:var(--font-inter)] mb-4">
          {greetGuest(name)}
        </p>

        {rsvpBadge === 'si' && (
          <Link href="/rsvp"
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-sunset text-night text-sm font-semibold shadow-sm hover:opacity-90 motion-safe:hover:scale-[1.02] transition-all font-[family-name:var(--font-inter)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Presenza confermata — Modifica
          </Link>
        )}
        {rsvpBadge === 'no' && (
          <Link href="/rsvp"
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/60 text-night text-sm font-semibold hover:bg-white/80 transition-colors font-[family-name:var(--font-inter)]">
            Hai risposto che non verrai — Modifica
          </Link>
        )}
        {rsvpBadge === 'accompagnatore' && (
          <Link href="/rsvp"
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-lilac text-night text-sm font-semibold hover:bg-lilac/70 transition-colors font-[family-name:var(--font-inter)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Sei già registrato/a come accompagnatore
          </Link>
        )}
        {rsvpBadge === 'none' && (
          <Link href="/rsvp"
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border-2 border-night/20 text-night/60 text-sm font-semibold hover:border-sunset hover:text-night transition-colors font-[family-name:var(--font-inter)]">
            Non hai ancora risposto — vai a Partecipo
          </Link>
        )}

        <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-6xl font-bold text-night leading-tight mb-3">
          Marco &amp; Cristina
        </h1>

        <p className="text-night/70 text-lg sm:text-xl font-[family-name:var(--font-inter)] mb-1">
          {WEDDING_DATE}
        </p>

        <CountdownDisplay />

        <div className="w-full max-w-md sm:max-w-xl mx-auto rounded-2xl shadow-lg overflow-hidden mt-8 border border-white/30">
          <div className="relative w-full h-72 sm:h-96">
            <Image
              src="/costa-ponente.jpg"
              alt={WEDDING_LOCATION}
              fill
              sizes="(max-width: 640px) 100vw, 576px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── 2. QUANDO ────────────────────────────────────────────── */}
      <section id="quando" className="px-5 py-8 sm:py-12 text-center">
        <p className="text-night/70 text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-inter)] mb-2">La data</p>
        <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-5xl font-bold text-night mb-2">
          Quando?
        </h2>
        <hr className="divider-sunset !mb-6" />

        <p className="font-[family-name:var(--font-lora)] text-2xl sm:text-3xl text-night font-semibold mb-1">
          {WEDDING_DATE}
        </p>
        <p className="text-night/70 text-lg sm:text-xl font-[family-name:var(--font-inter)] mb-6">
          ore {WEDDING_TIME}
        </p>

        <div className="max-w-md mx-auto bg-white/80 rounded-2xl px-6 py-4 shadow-sm border-l-4 border-sunset">
          <p className="text-night text-base sm:text-lg leading-relaxed font-[family-name:var(--font-inter)]">
            Vi chiediamo la cortesia di arrivare puntuali: scatteremo le foto al tramonto e vogliamo avervi tutti con noi!
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* ── 3. DOVE ──────────────────────────────────────────────── */}
      <section id="dove" className="px-5 py-8 sm:py-12 text-center">
        <p className="text-night/70 text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-inter)] mb-2">La location</p>
        <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-5xl font-bold text-night mb-2">
          Dove?
        </h2>
        <hr className="divider-sunset !mb-6" />

        <div className="w-full max-w-sm mx-auto">
          <div className="w-full rounded-2xl shadow-lg overflow-hidden border border-night/10">
            <div className="w-full h-48">
              <iframe
                title="Mappa location"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                src="https://maps.google.com/maps?q=Via+Giuseppe+Pavone+91,+90151+Palermo&output=embed&z=15"
              />
            </div>
            <div className="bg-white px-4 py-4 flex flex-col items-center gap-3">
              <div className="text-center">
                <p className="text-night font-semibold text-base font-[family-name:var(--font-inter)]">
                  {WEDDING_LOCATION}
                </p>
                <p className="text-night/60 text-sm font-[family-name:var(--font-inter)]">
                  Via Giuseppe Pavone 91 — Mondello, Palermo
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <a
                  href={WEDDING_VENUE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-night text-white rounded-lg px-3 py-2 text-xs font-semibold hover:bg-night/80 transition-colors font-[family-name:var(--font-inter)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  Sito della location
                </a>
                <a
                  href={WEDDING_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-sunset text-night rounded-lg px-3 py-2 text-xs font-semibold hover:opacity-90 transition-opacity font-[family-name:var(--font-inter)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Indicazioni stradali
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── 4. PROGRAMMA ─────────────────────────────────────────── */}
      <section id="programma" className="px-5 py-8 sm:py-12 text-center">
        <p className="text-night/70 text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-inter)] mb-2">La giornata</p>
        <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-5xl font-bold text-night mb-2">
          Cosa vi aspetta?
        </h2>
        <hr className="divider-sunset !mb-8" />

        <div className="max-w-lg mx-auto text-left">
          <div className="relative pl-10">
            <div className="absolute left-3.5 top-5 bottom-5 w-0.5 bg-night/20" />
            {PROGRAM.map((item, i) => (
              <div key={i} className={i < PROGRAM.length - 1 ? 'mb-5' : ''}>
                <div className="relative">
                  <div className="absolute -left-6 top-4 w-4 h-4 rounded-full bg-sunset border-2 border-white shadow-sm" />
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-night/10">
                    <span className="font-[family-name:var(--font-inter)] text-sunset text-sm font-bold tracking-wider">
                      {item.time}
                    </span>
                    <p className="font-[family-name:var(--font-lora)] text-night text-lg font-semibold mt-1">
                      {item.title}
                    </p>
                    {item.note && (
                      <p className="text-night/60 text-sm mt-2 font-[family-name:var(--font-inter)] italic border-t border-night/10 pt-2">
                        &ldquo;{item.note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── 5. FAQ ───────────────────────────────────────────────── */}
      <section id="faq" className="px-5 py-8 sm:py-12">
        <div className="text-center mb-6">
          <p className="text-night/70 text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-inter)] mb-2">Hai dubbi?</p>
          <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-5xl font-bold text-night mb-2">
            Domande frequenti
          </h2>
          <hr className="divider-sunset" />
        </div>
        <FaqAccordion />
      </section>

      <SectionDivider />

      {/* ── 6. CTA FINALE ────────────────────────────────────────── */}
      <section className="px-5 py-8 sm:py-12">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-lora)] text-3xl sm:text-4xl font-bold text-night mb-2">
            Ci sei?
          </h2>
          <p className="text-night/70 text-base sm:text-lg mb-6 leading-relaxed font-[family-name:var(--font-inter)]">
            Facci sapere se sarai con noi e, se vuoi, inviaci un pensiero di auguri.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/rsvp"
              className="btn-sunset flex items-center justify-center text-center py-4 px-3 text-sm sm:text-base leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]"
            >
              Confermo la mia presenza
            </Link>
            <Link
              href="/regalo"
              className="flex items-center justify-center text-center border-2 border-night text-night rounded-2xl py-4 px-3 text-sm sm:text-base leading-tight font-semibold hover:bg-night hover:text-white motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]"
            >
              Voglio fare un regalo
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
