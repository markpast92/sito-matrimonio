'use client'
import { useState } from 'react'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        window.location.href = '/admin'
      } else {
        setError('Credenziali non valide.')
        setLoading(false)
      }
    } catch {
      setError('Errore di connessione. Riprova.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-5">
      <div className="card p-8 w-full max-w-sm animate-slide-up">
        <h1 className="text-xl sm:text-2xl font-bold text-night mb-1 text-center">Area admin</h1>
        <p className="text-dust text-center text-sm mb-7 font-[family-name:var(--font-inter)]">
          Accesso riservato a Marco e Cristina
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder="Username" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            className="border-2 border-lilac rounded-xl px-4 py-3.5 text-lg outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all placeholder:text-dust/50 font-[family-name:var(--font-inter)]"
            autoComplete="username" autoFocus />
          <input type="password" placeholder="Password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="border-2 border-lilac rounded-xl px-4 py-3.5 text-lg outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all placeholder:text-dust/50 font-[family-name:var(--font-inter)]"
            autoComplete="current-password" />
          {error && (
            <p className="text-red-500 text-center font-medium text-sm font-[family-name:var(--font-inter)]">{error}</p>
          )}
          <button type="submit" disabled={loading || !form.username || !form.password}
            className="py-4 text-lg rounded-2xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]"
            style={{ background: 'linear-gradient(135deg, #193250 0%, #22416a 100%)' }}>
            {loading ? 'Accesso...' : 'Entra'}
          </button>
        </form>
      </div>
    </main>
  )
}
