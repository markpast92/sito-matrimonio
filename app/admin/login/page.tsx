'use client'
import { useState } from 'react'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
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
    <main className="min-h-screen bg-pale flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-night mb-2 text-center">
          Area admin
        </h1>
        <p className="text-dust text-center mb-8">Accesso riservato a Marco e Cristina</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            className="border-2 border-lilac rounded-xl p-4 text-xl outline-none focus:border-sunset"
            autoComplete="username"
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="border-2 border-lilac rounded-xl p-4 text-xl outline-none focus:border-sunset"
            autoComplete="current-password"
          />
          {error && <p className="text-red-600 text-center font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading || !form.username || !form.password}
            className="bg-night text-white rounded-xl p-4 text-xl font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? 'Accesso...' : 'Entra'}
          </button>
        </form>
      </div>
    </main>
  )
}
