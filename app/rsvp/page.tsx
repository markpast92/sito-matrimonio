'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'

type Ospite = {
  nome: string
  cognome: string
  menu: 'standard' | 'vegetariano' | 'vegano' | 'altro'
  menuAltro: string
  allergie: string
}

const newOspite = (): Ospite => ({
  nome: '', cognome: '', menu: 'standard', menuAltro: '', allergie: '',
})

const MENU = [
  { value: 'standard',    label: 'Menu standard' },
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'vegano',      label: 'Vegano' },
  { value: 'altro',       label: 'Altro (specifica)' },
]

const inputCls = "border-2 border-lilac rounded-xl px-4 py-3.5 text-lg outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all w-full placeholder:text-dust/50 font-[family-name:var(--font-inter)]"

function MenuAllergie({ ospite, onChange, prefix }: {
  ospite: Ospite
  onChange: (f: keyof Ospite, v: string) => void
  prefix: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-night text-base font-semibold mb-3 font-[family-name:var(--font-inter)]">Menu</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MENU.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 hover:border-sunset ${
                ospite.menu === opt.value
                  ? 'border-sunset bg-gradient-to-r from-sunset/10 to-lilac/10'
                  : 'border-lilac'
              }`}
            >
              <input
                type="radio"
                name={`menu-${prefix}`}
                value={opt.value}
                checked={ospite.menu === opt.value}
                onChange={() => onChange('menu', opt.value)}
                className="w-5 h-5 accent-sunset shrink-0"
              />
              <span className="text-base font-[family-name:var(--font-inter)]">{opt.label}</span>
            </label>
          ))}
        </div>
        {ospite.menu === 'altro' && (
          <input
            type="text"
            placeholder="Descrivi le tue esigenze alimentari..."
            value={ospite.menuAltro}
            onChange={e => onChange('menuAltro', e.target.value)}
            className={`mt-3 ${inputCls}`}
          />
        )}
      </div>
      <div>
        <label className="text-night text-base font-semibold block mb-2 font-[family-name:var(--font-inter)]">
          Allergie o intolleranze{' '}
          <span className="text-dust font-normal">(facoltativo)</span>
        </label>
        <input
          type="text"
          placeholder="Es. glutine, lattosio, frutta a guscio..."
          value={ospite.allergie}
          onChange={e => onChange('allergie', e.target.value)}
          className={inputCls}
        />
      </div>
    </div>
  )
}

function AccompagnatoreCard({ ospite, index, onChange, onRemove }: {
  ospite: Ospite
  index: number
  onChange: (f: keyof Ospite, v: string) => void
  onRemove: () => void
}) {
  return (
    <div className="border-2 border-lilac rounded-2xl p-5 flex flex-col gap-4 animate-slide-up">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full btn-sunset flex items-center justify-center text-sm font-bold font-[family-name:var(--font-inter)]">
            {index + 1}
          </span>
          <h3 className="text-lg font-semibold text-night">Accompagnatore</h3>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-dust underline text-base hover:text-night transition-colors font-[family-name:var(--font-inter)]"
        >
          Rimuovi
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" placeholder="Nome" value={ospite.nome}
          onChange={e => onChange('nome', e.target.value)} required className={inputCls} />
        <input type="text" placeholder="Cognome" value={ospite.cognome}
          onChange={e => onChange('cognome', e.target.value)} required className={inputCls} />
      </div>
      <MenuAllergie ospite={ospite} onChange={onChange} prefix={`acc-${index}`} />
    </div>
  )
}

export default function RSVPPage() {
  const [partecipa, setPartecipa] = useState(true)
  const [principale, setPrincipale] = useState<Ospite>(newOspite())
  const [accompagnatori, setAccompagnatori] = useState<Ospite[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const nome = localStorage.getItem('guest_name') || ''
    const cognome = localStorage.getItem('guest_surname') || ''
    if (nome) setPrincipale(p => ({ ...p, nome, cognome }))
  }, [])

  function updatePrincipale(f: keyof Ospite, v: string) {
    setPrincipale(p => ({ ...p, [f]: v }))
  }
  function updateAcc(i: number, f: keyof Ospite, v: string) {
    setAccompagnatori(a => a.map((o, idx) => idx === i ? { ...o, [f]: v } : o))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!principale.nome.trim() || !principale.cognome.trim()) {
      setError('Per favore inserisci il tuo nome e cognome.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ principale, accompagnatori, partecipa }),
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
            {partecipa ? (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-night mb-4">Grazie!</h1>
                <p className="text-dust text-lg sm:text-xl leading-relaxed font-[family-name:var(--font-inter)]">
                  La tua presenza è confermata.<br />Ci vediamo il 10 settembre 2027!
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-night mb-4">Grazie per averci risposto</h1>
                <p className="text-dust text-lg sm:text-xl leading-relaxed font-[family-name:var(--font-inter)]">
                  Peccato non averti con noi, ma ti vogliamo bene lo stesso!
                </p>
              </>
            )}
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      {/* Fascia gradiente sotto nav */}
      <div className="bg-page-top h-24 -mb-24 pointer-events-none" />

      <main className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-night mb-3">Conferma la tua presenza</h1>
        <p className="text-dust text-base sm:text-lg mb-8 leading-relaxed font-[family-name:var(--font-inter)]">
          Dicci se ci sarai! Compila il modulo e clicca &ldquo;Invia&rdquo;.
          Se vuoi modificare una risposta già inviata, basta compilare di nuovo.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Partecipo / Non partecipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button type="button" onClick={() => setPartecipa(true)}
              className={`py-5 rounded-2xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset focus-visible:ring-offset-2 font-[family-name:var(--font-inter)] ${
                partecipa
                  ? 'btn-sunset'
                  : 'bg-white border-2 border-lilac text-night hover:border-sunset'
              }`}>
              Ci sono!
            </button>
            <button type="button" onClick={() => { setPartecipa(false); setAccompagnatori([]) }}
              className={`py-5 rounded-2xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dust focus-visible:ring-offset-2 font-[family-name:var(--font-inter)] ${
                !partecipa
                  ? 'bg-dust text-white shadow-md'
                  : 'bg-white border-2 border-lilac text-night hover:border-dust'
              }`}>
              Purtroppo no
            </button>
          </div>

          <hr className="border-lilac" />

          {/* Nome e cognome */}
          <div>
            <p className="text-night text-base font-semibold mb-3 font-[family-name:var(--font-inter)]">I tuoi dati</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-dust text-sm block mb-1.5 font-[family-name:var(--font-inter)]">Nome</label>
                <input type="text" value={principale.nome} onChange={e => updatePrincipale('nome', e.target.value)}
                  placeholder="Nome" required className={inputCls} autoComplete="given-name" />
              </div>
              <div>
                <label className="text-dust text-sm block mb-1.5 font-[family-name:var(--font-inter)]">Cognome</label>
                <input type="text" value={principale.cognome} onChange={e => updatePrincipale('cognome', e.target.value)}
                  placeholder="Cognome" required className={inputCls} autoComplete="family-name" />
              </div>
            </div>
          </div>

          {partecipa && (
            <>
              <hr className="border-lilac" />
              <MenuAllergie ospite={principale} onChange={updatePrincipale} prefix="principale" />
              {accompagnatori.length > 0 && <hr className="border-lilac" />}
              {accompagnatori.map((acc, i) => (
                <AccompagnatoreCard key={i} ospite={acc} index={i}
                  onChange={(f, v) => updateAcc(i, f, v)}
                  onRemove={() => setAccompagnatori(a => a.filter((_, idx) => idx !== i))} />
              ))}
              <button type="button" onClick={() => setAccompagnatori(a => [...a, newOspite()])}
                className="border-2 border-dashed border-sunset text-sunset rounded-2xl py-4 text-base font-semibold hover:bg-sunset/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]">
                + Aggiungi un accompagnatore
              </button>
            </>
          )}

          {error && (
            <p className="text-red-500 text-base font-medium text-center font-[family-name:var(--font-inter)]">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="btn-sunset py-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]">
            {loading ? 'Invio in corso...' : 'Invia'}
          </button>
        </form>
      </main>
    </>
  )
}
