'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'

export default function RegaloPage() {
  const [form, setForm] = useState({ nome: '', email: '', importo: '', messaggio: '' })
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
    if (!form.email.trim()) { setError("Inserisci la tua email per ricevere le coordinate."); return }
    setLoading(true); setError('')
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
        <main className="max-w-2xl mx-auto px-5 py-12 text-center">
          <div className="card p-10 animate-slide-up">
            <div className="w-16 h-16 rounded-full btn-sunset flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-night mb-4">Perfetto, grazie!</h1>
            <p className="text-dust text-lg sm:text-xl leading-relaxed font-[family-name:var(--font-inter)]">
              Controlla la tua email: ti abbiamo mandato le coordinate bancarie per fare il bonifico.
            </p>
          </div>
        </main>
      </>
    )
  }

  const inputCls = "border-2 border-lilac rounded-xl px-4 py-3.5 text-lg outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all w-full placeholder:text-dust/50 font-[family-name:var(--font-inter)]"

  return (
    <>
      <Nav />
      {/* Fascia gradiente sotto nav */}
      <div className="bg-page-top h-24 -mb-24 pointer-events-none" />

      <main className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-night mb-4">Regalo di nozze</h1>

        {/* Info box con gradiente */}
        <div className="bg-info-gradient rounded-2xl p-5 mb-8 flex gap-4 items-start">
          <span className="text-2xl leading-none mt-0.5">💌</span>
          <p className="text-night text-base sm:text-lg leading-relaxed font-[family-name:var(--font-inter)]">
            <strong>Come funziona:</strong> inserisci la tua email qui sotto e
            ti mandiamo subito un messaggio con i dati per fare un normale
            bonifico bancario. Niente pagamento online, niente carte di credito.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-night text-base font-semibold block mb-2 font-[family-name:var(--font-inter)]">Il tuo nome</label>
            <input type="text" value={form.nome} onChange={e => update('nome', e.target.value)}
              placeholder="Nome e cognome" className={inputCls} autoComplete="name" />
          </div>
          <div>
            <label className="text-night text-base font-semibold block mb-2 font-[family-name:var(--font-inter)]">
              La tua email <span className="text-red-500">*</span>
            </label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
              placeholder="nome@esempio.it" required className={inputCls} autoComplete="email" />
          </div>
          <div>
            <label className="text-night text-base font-semibold block mb-2 font-[family-name:var(--font-inter)]">
              Importo orientativo <span className="text-dust font-normal">(facoltativo, in euro)</span>
            </label>
            <input type="number" value={form.importo} onChange={e => update('importo', e.target.value)}
              placeholder="Es. 50" min="1" className={inputCls} />
          </div>
          <div>
            <label className="text-night text-base font-semibold block mb-2 font-[family-name:var(--font-inter)]">
              Un messaggio di auguri <span className="text-dust font-normal">(facoltativo)</span>
            </label>
            <textarea value={form.messaggio} onChange={e => update('messaggio', e.target.value)}
              placeholder="Scrivi quello che ti va..." rows={4}
              className={`${inputCls} resize-none`} />
          </div>

          {error && (
            <p className="text-red-500 text-base font-medium text-center font-[family-name:var(--font-inter)]">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="btn-sunset py-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]">
            {loading ? 'Invio in corso...' : 'Invia — riceverai una email'}
          </button>
        </form>
      </main>
    </>
  )
}
