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
  { value: 'standard', label: 'Menu standard' },
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'vegano', label: 'Vegano' },
  { value: 'altro', label: 'Altro (specifica)' },
]

function MenuAllergie({
  ospite, onChange, prefix,
}: {
  ospite: Ospite
  onChange: (f: keyof Ospite, v: string) => void
  prefix: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-night text-lg font-medium mb-2">Menu</p>
        <div className="grid grid-cols-2 gap-2">
          {MENU.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                ospite.menu === opt.value ? 'border-sunset bg-sunset/10' : 'border-lilac'
              }`}
            >
              <input
                type="radio"
                name={`menu-${prefix}`}
                value={opt.value}
                checked={ospite.menu === opt.value}
                onChange={() => onChange('menu', opt.value)}
                className="w-5 h-5 accent-sunset"
              />
              <span className="text-lg">{opt.label}</span>
            </label>
          ))}
        </div>
        {ospite.menu === 'altro' && (
          <input
            type="text"
            placeholder="Descrivi le tue esigenze alimentari..."
            value={ospite.menuAltro}
            onChange={e => onChange('menuAltro', e.target.value)}
            className="mt-2 border-2 border-lilac rounded-xl p-4 text-xl outline-none focus:border-sunset w-full"
          />
        )}
      </div>
      <div>
        <label className="text-night text-lg font-medium block mb-2">
          Allergie o intolleranze{' '}
          <span className="text-dust font-normal">(facoltativo)</span>
        </label>
        <input
          type="text"
          placeholder="Es. glutine, lattosio, frutta a guscio..."
          value={ospite.allergie}
          onChange={e => onChange('allergie', e.target.value)}
          className="border-2 border-lilac rounded-xl p-4 text-xl outline-none focus:border-sunset w-full"
        />
      </div>
    </div>
  )
}

function AccompagnatoreCard({
  ospite, index, onChange, onRemove,
}: {
  ospite: Ospite
  index: number
  onChange: (f: keyof Ospite, v: string) => void
  onRemove: () => void
}) {
  return (
    <div className="border-2 border-lilac rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-night">
          Accompagnatore {index + 1}
        </h3>
        <button
          type="button"
          onClick={onRemove}
          className="text-dust underline text-lg"
        >
          Rimuovi
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nome"
          value={ospite.nome}
          onChange={e => onChange('nome', e.target.value)}
          required
          className="border-2 border-lilac rounded-xl p-4 text-xl outline-none focus:border-sunset"
        />
        <input
          type="text"
          placeholder="Cognome"
          value={ospite.cognome}
          onChange={e => onChange('cognome', e.target.value)}
          required
          className="border-2 border-lilac rounded-xl p-4 text-xl outline-none focus:border-sunset"
        />
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
        <main className="max-w-2xl mx-auto px-6 py-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-10">
            <div className="w-16 h-16 bg-sunset rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            {partecipa ? (
              <>
                <h1 className="text-3xl font-bold text-night mb-4">Grazie!</h1>
                <p className="text-dust text-xl leading-relaxed">
                  La tua presenza è confermata.<br />Ci vediamo il 10 settembre 2027!
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-night mb-4">
                  Grazie per averci risposto
                </h1>
                <p className="text-dust text-xl leading-relaxed">
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
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-night mb-4">Conferma la tua presenza</h1>
        <p className="text-dust text-xl mb-8 leading-relaxed">
          Dicci se ci sarai! Compila il modulo e clicca &ldquo;Invia&rdquo;.
          Se vuoi modificare una risposta già inviata, basta compilare di nuovo.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Partecipo / Non partecipo */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPartecipa(true)}
              className={`py-5 rounded-2xl text-xl font-semibold transition-colors ${
                partecipa
                  ? 'bg-sunset text-white'
                  : 'bg-white border-2 border-lilac text-night hover:border-sunset'
              }`}
            >
              Ci sono!
            </button>
            <button
              type="button"
              onClick={() => { setPartecipa(false); setAccompagnatori([]) }}
              className={`py-5 rounded-2xl text-xl font-semibold transition-colors ${
                !partecipa
                  ? 'bg-dust text-white'
                  : 'bg-white border-2 border-lilac text-night hover:border-dust'
              }`}
            >
              Purtroppo no
            </button>
          </div>

          {/* Nome e cognome — sempre visibili */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-night text-lg font-medium block mb-2">Il tuo nome</label>
              <input
                type="text"
                value={principale.nome}
                onChange={e => updatePrincipale('nome', e.target.value)}
                placeholder="Nome"
                required
                className="border-2 border-lilac rounded-xl p-4 text-xl outline-none focus:border-sunset w-full"
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="text-night text-lg font-medium block mb-2">Il tuo cognome</label>
              <input
                type="text"
                value={principale.cognome}
                onChange={e => updatePrincipale('cognome', e.target.value)}
                placeholder="Cognome"
                required
                className="border-2 border-lilac rounded-xl p-4 text-xl outline-none focus:border-sunset w-full"
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Sezione menu + accompagnatori — solo se partecipa */}
          {partecipa && (
            <>
              <MenuAllergie ospite={principale} onChange={updatePrincipale} prefix="principale" />

              {accompagnatori.map((acc, i) => (
                <AccompagnatoreCard
                  key={i}
                  ospite={acc}
                  index={i}
                  onChange={(f, v) => updateAcc(i, f, v)}
                  onRemove={() => setAccompagnatori(a => a.filter((_, idx) => idx !== i))}
                />
              ))}

              <button
                type="button"
                onClick={() => setAccompagnatori(a => [...a, newOspite()])}
                className="border-2 border-dashed border-sunset text-sunset rounded-2xl py-5 text-xl font-semibold hover:bg-sunset/10 transition-colors"
              >
                + Aggiungi un accompagnatore
              </button>
            </>
          )}

          {error && (
            <p className="text-red-600 text-lg font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-sunset text-white rounded-2xl py-5 text-xl font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? 'Invio in corso...' : 'Invia'}
          </button>
        </form>
      </main>
    </>
  )
}
