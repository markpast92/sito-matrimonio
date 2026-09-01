'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { greetGuest, WEDDING_DATE, WEDDING_LOCATION, WEDDING_VENUE_URL, WEDDING_MAPS_URL } from '@/lib/constants'

export default function HomeClient() {
  const [name, setName] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', cognome: '' })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('guest_name')
    setName(saved && saved.trim() ? saved : null)
    setReady(true)
  }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const n = form.nome.trim()
    if (!n) return
    localStorage.setItem('guest_name', n)
    localStorage.setItem('guest_surname', form.cognome.trim())
    setName(n)
  }

  if (!ready) return <div className="min-h-screen bg-white" />

  // ── Prima visita: raccolta nome ──
  if (!name) {
    return (
      <main className="min-h-screen bg-hero flex items-center justify-center p-5">
        <div className="w-full max-w-sm animate-slide-up">
          <p className="text-center font-[family-name:var(--font-lora)] text-white text-3xl font-bold mb-1 tracking-widest drop-shadow">
            M &amp; C
          </p>
          <p className="text-center text-white/80 text-sm mb-8 tracking-[0.2em] uppercase font-[family-name:var(--font-inter)]">
            10 settembre 2027
          </p>

          <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl p-7">
            <h1 className="text-xl sm:text-2xl font-bold text-night text-center mb-1">
              Marco &amp; Cristina
            </h1>
            <p className="text-dust text-center text-base mb-7 font-[family-name:var(--font-inter)]">
              Prima di entrare, come ti chiami?
            </p>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nome"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                className="border-2 border-lilac rounded-xl px-4 py-3.5 text-lg text-night outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all placeholder:text-dust/50 font-[family-name:var(--font-inter)]"
                autoFocus
                autoComplete="given-name"
              />
              <input
                type="text"
                placeholder="Cognome"
                value={form.cognome}
                onChange={e => setForm(f => ({ ...f, cognome: e.target.value }))}
                className="border-2 border-lilac rounded-xl px-4 py-3.5 text-lg text-night outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all placeholder:text-dust/50 font-[family-name:var(--font-inter)]"
                autoComplete="family-name"
              />
              <button
                type="submit"
                disabled={!form.nome.trim()}
                className="btn-sunset py-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]"
              >
                Entra
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  // ── Home principale ──
  return (
    <>
      <Nav />

      {/* Hero gradient */}
      <section className="bg-hero px-5 py-16 sm:py-24 text-center animate-fade-in">
        <p className="text-night/60 text-sm sm:text-base tracking-[0.2em] uppercase font-[family-name:var(--font-inter)] mb-6">
          {greetGuest(name)}
        </p>

        <h1 className="font-[family-name:var(--font-lora)] text-4xl sm:text-6xl font-bold text-night leading-tight mb-4">
          Marco &amp; Cristina
        </h1>

        <hr className="divider-sunset mb-6" />

        <p className="text-night/70 text-lg sm:text-xl font-[family-name:var(--font-inter)] mb-6">
          {WEDDING_DATE}
        </p>

        {/* Location card */}
        <div className="w-full max-w-sm mx-auto rounded-2xl shadow-lg overflow-hidden mb-2 border border-white/30">
          {/* Mappa piccola */}
          <div className="w-full h-32">
            <iframe
              title="Mappa location"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              src="https://maps.google.com/maps?q=Via+Giuseppe+Pavone+91,+90151+Palermo&output=embed&z=15"
            />
          </div>
          {/* Info + link */}
          <div className="bg-white/80 backdrop-blur-sm px-4 py-3 flex flex-col items-center gap-2.5">
            <div className="text-center">
              <p className="text-night font-semibold text-base font-[family-name:var(--font-inter)]">
                {WEDDING_LOCATION}
              </p>
              <p className="text-dust text-sm font-[family-name:var(--font-inter)]">
                Via Giuseppe Pavone 91 — Mondello, Palermo
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href={WEDDING_VENUE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-night text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-night/80 transition-colors font-[family-name:var(--font-inter)]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                Sito della location
              </a>
              <a
                href={WEDDING_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-sunset text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-sunset/80 transition-colors font-[family-name:var(--font-inter)]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Indicazioni stradali
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-white px-5 py-10">
        <p className="text-center text-dust text-base sm:text-lg mb-7 leading-relaxed max-w-xl mx-auto font-[family-name:var(--font-inter)]">
          Questo sito ti permette di confermare la tua presenza e, se vuoi,
          di inviarci un pensiero di auguri.
        </p>

        <div className="flex flex-wrap justify-center gap-3 animate-slide-up-delay">
          <Link
            href="/rsvp"
            className="btn-sunset py-3.5 px-7 text-base text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]"
          >
            Confermo la mia presenza
          </Link>
          <Link
            href="/regalo"
            className="border-2 border-night text-night rounded-2xl py-3.5 px-7 text-base font-semibold text-center hover:bg-night hover:text-white hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]"
          >
            Voglio fare un regalo
          </Link>
        </div>
      </section>
    </>
  )
}
