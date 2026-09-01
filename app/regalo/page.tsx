'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'

export default function RegaloPage() {
  const [form, setForm] = useState({
    nome: '', email: '', importo: '', messaggio: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const nome = localStorage.getItem('guest_name') || ''
    const cognome = localStorage.getItem('guest_surname') || ''
    const fullName = [nome, cognome].filter(Boolean).join(' ')
    if (fullName) setForm(f => ({ ...f, nome: fullName }))
  }, [])

  function update(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email.trim()) {
      setError("Inserisci la tua email per ricevere le coordinate.")
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/regalo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Errore imprevisto. Riprova.')
      }
    } catch {
      setError('Errore di connessione. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <>
        <Nav />
        <main className="max-w-2xl mx-auto px-6 py-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-10">
            <div className="w-16 h-16 bg-sunset rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-night mb-4">Perfetto, grazie!</h1>
            <p className="text-dust text-xl leading-relaxed">
              Controlla la tua email: ti abbiamo mandato le coordinate bancarie
              per fare il bonifico.
            </p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-night mb-4">Regalo di nozze</h1>

        {/* Spiegazione del meccanismo — fondamentale prima del form */}
        <div className="bg-lilac rounded-2xl p-6 mb-8">
          <p className="text-night text-xl leading-relaxed">
            <strong>Come funziona:</strong> inserisci la tua email qui sotto e
            ti mandiamo subito un messaggio con i dati per fare un normale
            bonifico bancario. Niente pagamento online, niente carte di credito.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="text-night text-lg font-medium block mb-2">
              Il tuo nome
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={e => update('nome', e.target.value)}
              placeholder="Nome e cognome"
              className="border-2 border-lilac rounded-xl p-4 text-xl outline-none focus:border-sunset w-full"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="text-night text-lg font-medium block mb-2">
              La tua email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="nome@esempio.it"
              required
              className="border-2 border-lilac rounded-xl p-4 text-xl outline-none focus:border-sunset w-full"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-night text-lg font-medium block mb-2">
              Importo orientativo{' '}
              <span className="text-dust font-normal">(facoltativo, in euro)</span>
            </label>
            <input
              type="number"
              value={form.importo}
              onChange={e => update('importo', e.target.value)}
              placeholder="Es. 50"
              min="1"
              className="border-2 border-lilac rounded-xl p-4 text-xl outline-none focus:border-sunset w-full"
            />
          </div>

          <div>
            <label className="text-night text-lg font-medium block mb-2">
              Un messaggio di auguri{' '}
              <span className="text-dust font-normal">(facoltativo)</span>
            </label>
            <textarea
              value={form.messaggio}
              onChange={e => update('messaggio', e.target.value)}
              placeholder="Scrivi quello che ti va..."
              rows={4}
              className="border-2 border-lilac rounded-xl p-4 text-xl outline-none focus:border-sunset w-full resize-none"
            />
          </div>

          {error && (
            <p className="text-red-600 text-lg font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-sunset text-white rounded-2xl py-5 text-xl font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? 'Invio in corso...' : 'Invia — riceverai una email'}
          </button>
        </form>
      </main>
    </>
  )
}
