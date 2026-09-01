'use client'
import { useState } from 'react'

export default function PasswordPage() {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      if (res.ok) {
        const data = await res.json()
        window.location.href = data.admin ? '/admin' : '/'
      } else {
        setError('Password errata. Riprova.')
        setLoading(false)
      }
    } catch {
      setError('Errore di connessione. Riprova.')
      setLoading(false)
    }
  }

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
          <h1 className="text-xl sm:text-2xl font-bold text-night text-center mb-2">
            Marco &amp; Cristina
          </h1>
          <p className="text-dust text-center text-base mb-7 font-[family-name:var(--font-inter)]">
            Inserisci la password che ti abbiamo inviato
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Password"
              className="border-2 border-lilac rounded-xl px-4 py-3.5 text-lg text-night outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all placeholder:text-dust/50 font-[family-name:var(--font-inter)]"
              autoFocus
              autoComplete="current-password"
            />
            {error && (
              <p className="text-red-500 text-center font-medium text-sm font-[family-name:var(--font-inter)]">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !pw}
              className="btn-sunset py-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]"
            >
              {loading ? 'Controllo...' : 'Entra'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
