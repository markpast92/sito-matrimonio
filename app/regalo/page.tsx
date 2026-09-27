'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'

type FieldErrors = { email?: string; importo?: string; general?: string }

export default function RegaloPage() {
  const [form, setForm] = useState({ nome: '', email: '', importo: '', messaggio: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    const nome = localStorage.getItem('guest_name') || ''
    const cognome = localStorage.getItem('guest_surname') || ''
    const fullName = [nome, cognome].filter(Boolean).join(' ')
    if (fullName) setForm(f => ({ ...f, nome: fullName }))
  }, [])

  function update(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined, general: undefined }))
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    const email = form.email.trim()
    if (!email) next.email = 'Inserisci la tua email per ricevere le coordinate.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Controlla la tua email: sembra non essere valida.'

    const importoNum = Number(form.importo)
    if (!form.importo.trim()) next.importo = 'Indica la cifra che intendi versare.'
    else if (!Number.isFinite(importoNum) || importoNum <= 0) next.importo = 'Inserisci un numero valido (es. 50).'

    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length > 0) { setErrors(next); return }
    setLoading(true); setErrors({})
    try {
      const res = await fetch('/api/regalo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, importo: Number(form.importo) }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setErrors({ general: data.error || 'Errore imprevisto. Riprova.' })
      }
    } catch {
      setErrors({ general: 'Errore di connessione. Riprova.' })
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
            <h1 className="text-2xl sm:text-3xl font-bold text-night mb-4 font-[family-name:var(--font-lora)]">Perfetto, grazie!</h1>
            <p className="text-night/70 text-lg sm:text-xl leading-relaxed font-[family-name:var(--font-inter)]">
              Controlla la tua email: ti abbiamo mandato le coordinate bancarie per fare il bonifico.
            </p>
          </div>
        </main>
      </>
    )
  }

  const base = "border-2 rounded-xl px-4 py-3.5 text-lg text-night outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 transition-all w-full placeholder:text-night/30 font-[family-name:var(--font-inter)]"
  const fieldCls = (err?: string) => `${base} ${err ? 'border-error' : 'border-night/60'}`

  return (
    <>
      <Nav />
      {/* Fascia gradiente sotto nav */}
      <div className="bg-page-top h-24 -mb-24 pointer-events-none" />

      <main className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-night mb-4 font-[family-name:var(--font-lora)]">Regalo di nozze</h1>

        {/* Info box con gradiente */}
        <div className="bg-info-gradient rounded-2xl p-5 mb-8 flex gap-4 items-start">
          <svg className="w-6 h-6 text-sunset shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 6L2 7" />
          </svg>
          <p className="text-night text-base sm:text-lg leading-relaxed font-[family-name:var(--font-inter)]">
            <strong>Come funziona:</strong> inserisci la tua email qui sotto e
            ti mandiamo subito un messaggio con i dati per fare un normale
            bonifico bancario.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div>
            <label className="text-night text-base font-semibold block mb-2 font-[family-name:var(--font-inter)]">Il tuo nome</label>
            <input type="text" value={form.nome} onChange={e => update('nome', e.target.value)}
              placeholder="Nome e cognome" className={fieldCls()} autoComplete="name" />
          </div>

          <div>
            <label htmlFor="email" className="text-night text-base font-semibold block mb-2 font-[family-name:var(--font-inter)]">
              La tua email <span className="text-error">*</span>
            </label>
            <input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)}
              placeholder="nome@esempio.it" className={fieldCls(errors.email)}
              autoComplete="email" aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-err' : undefined} />
            {errors.email && (
              <p id="email-err" className="text-error text-sm mt-1.5 font-medium font-[family-name:var(--font-inter)]">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="importo" className="text-night text-base font-semibold block mb-2 font-[family-name:var(--font-inter)]">
              Cifra che intendi versare <span className="text-error">*</span>
            </label>
            <input id="importo" type="number" inputMode="numeric" value={form.importo}
              onChange={e => update('importo', e.target.value)}
              placeholder="Es. 50" min="1" step="1" className={fieldCls(errors.importo)}
              aria-invalid={!!errors.importo}
              aria-describedby={errors.importo ? 'importo-err' : undefined} />
            {errors.importo && (
              <p id="importo-err" className="text-error text-sm mt-1.5 font-medium font-[family-name:var(--font-inter)]">{errors.importo}</p>
            )}
          </div>

          <div>
            <label className="text-night text-base font-semibold block mb-2 font-[family-name:var(--font-inter)]">
              Un messaggio di auguri <span className="text-night/50 font-normal">(facoltativo)</span>
            </label>
            <textarea value={form.messaggio} onChange={e => update('messaggio', e.target.value)}
              placeholder="Scrivi quello che ti va..." rows={4}
              className={`${fieldCls()} resize-none`} />
          </div>

          {errors.general && (
            <p role="alert" className="text-error text-base font-medium text-center font-[family-name:var(--font-inter)]">{errors.general}</p>
          )}

          <button type="submit" disabled={loading}
            className="btn-sunset py-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]">
            {loading ? 'Invio in corso...' : 'Invia - riceverai una email'}
          </button>
        </form>
      </main>
    </>
  )
}
