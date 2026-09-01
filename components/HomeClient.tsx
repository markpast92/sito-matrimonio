'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { greetGuest, WEDDING_DATE, WEDDING_LOCATION, WEDDING_MAPS_URL } from '@/lib/constants'

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

  if (!ready) return <div className="min-h-screen bg-pale" />

  // Prima visita: raccolta nome
  if (!name) {
    return (
      <main className="min-h-screen bg-pale flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <h1 className="text-4xl font-bold text-night mb-2">Marco &amp; Cristina</h1>
          <p className="text-dust text-xl mb-8">Prima di entrare, come ti chiami?</p>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nome"
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className="border-2 border-lilac rounded-xl p-4 text-xl text-night outline-none focus:border-sunset"
              autoFocus
              autoComplete="given-name"
            />
            <input
              type="text"
              placeholder="Cognome"
              value={form.cognome}
              onChange={e => setForm(f => ({ ...f, cognome: e.target.value }))}
              className="border-2 border-lilac rounded-xl p-4 text-xl text-night outline-none focus:border-sunset"
              autoComplete="family-name"
            />
            <button
              type="submit"
              disabled={!form.nome.trim()}
              className="bg-sunset text-white rounded-xl p-4 text-xl font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              Entra
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-center text-sunset text-2xl font-semibold mb-8">
          {greetGuest(name)}
        </p>

        <h1 className="text-5xl font-bold text-night text-center mb-8">
          Marco &amp; Cristina
        </h1>

        <div className="bg-white rounded-2xl shadow p-6 mb-8 text-center">
          <p className="text-3xl font-semibold text-night mb-3">{WEDDING_DATE}</p>
          <a
            href={WEDDING_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sunset text-xl underline underline-offset-4"
          >
            {WEDDING_LOCATION} — apri mappa
          </a>
        </div>

        <p className="text-dust text-xl text-center mb-10 leading-relaxed">
          Questo sito ti permette di confermare la tua presenza e, se vuoi,
          di inviarci un pensiero di auguri. Niente complicazioni: segui
          le istruzioni nelle sezioni qui sotto.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/rsvp"
            className="bg-sunset text-white rounded-2xl py-6 px-4 text-xl font-semibold text-center hover:opacity-90 transition-opacity block"
          >
            Confermo la mia presenza
          </Link>
          <Link
            href="/regalo"
            className="bg-lilac text-night rounded-2xl py-6 px-4 text-xl font-semibold text-center hover:opacity-90 transition-opacity block"
          >
            Voglio fare un regalo
          </Link>
        </div>
      </main>
    </>
  )
}
