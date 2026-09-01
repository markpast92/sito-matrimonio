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
        // full reload: garantisce che il cookie sia letto dal middleware
        window.location.href = '/'
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
    <main className="min-h-screen bg-pale flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-4xl font-semibold text-night mb-2 text-center">
          Marco &amp; Cristina
        </h1>
        <p className="text-dust text-center text-lg mb-8">
          Inserisci la password che ti abbiamo inviato
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Password"
            className="border-2 border-lilac rounded-xl p-4 text-xl text-night outline-none focus:border-sunset"
            autoFocus
            autoComplete="current-password"
          />
          {error && (
            <p className="text-red-600 text-center font-medium">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !pw}
            className="bg-sunset text-white rounded-xl p-4 text-xl font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? 'Controllo...' : 'Entra'}
          </button>
        </form>
      </div>
    </main>
  )
}
