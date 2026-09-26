'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// ── Tipi ──────────────────────────────────────────────────────────────────────

type Ospite = {
  nome: string
  cognome: string
  menu: 'standard' | 'vegetariano' | 'vegano' | 'altro'
  menuAltro: string
  allergie: string
}

type AccompagnatoreDb = { id: string; rsvp_id: string; nome: string; cognome: string; menu: string; allergie: string | null }
type ExistingRsvp = { id: string; nome: string; cognome: string; partecipa: boolean; menu: string; allergie: string | null; rsvp_accompagnatori: AccompagnatoreDb[] }
type CheckState = 'loading' | 'none' | 'principale' | 'accompagnatore'

// ── Helpers ───────────────────────────────────────────────────────────────────

const newOspite = (): Ospite => ({ nome: '', cognome: '', menu: 'standard', menuAltro: '', allergie: '' })

function dbMenuToForm(menu: string): Pick<Ospite, 'menu' | 'menuAltro'> {
  if (menu === 'standard' || menu === 'vegetariano' || menu === 'vegano') return { menu, menuAltro: '' }
  if (menu === 'altro') return { menu: 'altro', menuAltro: '' }
  return { menu: 'altro', menuAltro: menu }
}

const MENU = [
  { value: 'standard',    label: 'Menu standard' },
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'vegano',      label: 'Vegano' },
  { value: 'altro',       label: 'Altro (specifica)' },
]

const inputCls = "border-2 border-night/60 rounded-xl px-4 py-3.5 text-lg outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 transition-all w-full placeholder:text-night/30 font-[family-name:var(--font-inter)]"

// ── Sub-componenti ────────────────────────────────────────────────────────────

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
            <label key={opt.value}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 hover:border-sunset ${
                ospite.menu === opt.value ? 'border-sunset bg-gradient-to-r from-sunset/10 to-lilac/10' : 'border-night/40'
              }`}>
              <input type="radio" name={`menu-${prefix}`} value={opt.value}
                checked={ospite.menu === opt.value} onChange={() => onChange('menu', opt.value)}
                className="w-5 h-5 accent-sunset shrink-0" />
              <span className="text-base font-[family-name:var(--font-inter)]">{opt.label}</span>
            </label>
          ))}
        </div>
        {ospite.menu === 'altro' && (
          <input type="text" placeholder="Descrivi le tue esigenze alimentari..."
            value={ospite.menuAltro} onChange={e => onChange('menuAltro', e.target.value)}
            className={`mt-3 ${inputCls}`} />
        )}
      </div>
      <div>
        <label className="text-night text-base font-semibold block mb-2 font-[family-name:var(--font-inter)]">
          Allergie o intolleranze <span className="text-night/50 font-normal">(facoltativo)</span>
        </label>
        <input type="text" placeholder="Es. glutine, lattosio, frutta a guscio..."
          value={ospite.allergie} onChange={e => onChange('allergie', e.target.value)} className={inputCls} />
      </div>
    </div>
  )
}

function AccompagnatoreCard({ ospite, index, onChange, onRemove }: {
  ospite: Ospite; index: number; onChange: (f: keyof Ospite, v: string) => void; onRemove: () => void
}) {
  return (
    <div className="border-2 border-night/30 rounded-2xl p-5 flex flex-col gap-4 animate-slide-up">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full btn-sunset flex items-center justify-center text-sm font-bold font-[family-name:var(--font-inter)]">{index + 1}</span>
          <h3 className="text-lg font-semibold text-night">Accompagnatore</h3>
        </div>
        <button type="button" onClick={onRemove}
          className="text-night/50 underline text-base hover:text-night transition-colors font-[family-name:var(--font-inter)]">
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

// ── Componente principale ─────────────────────────────────────────────────────

export default function RsvpSection({ embedded }: { embedded?: boolean }) {
  const [checkState, setCheckState] = useState<CheckState | null>(null)
  const [existingRsvp, setExistingRsvp] = useState<ExistingRsvp | null>(null)
  const [mainGuest, setMainGuest] = useState<{ nome: string; cognome: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [partecipa, setPartecipa] = useState(true)
  const [principale, setPrincipale] = useState<Ospite>(newOspite())
  const [accompagnatori, setAccompagnatori] = useState<Ospite[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function populateFromExisting(rsvp: ExistingRsvp) {
    setPartecipa(rsvp.partecipa)
    const { menu, menuAltro } = dbMenuToForm(rsvp.menu)
    setPrincipale({ nome: rsvp.nome, cognome: rsvp.cognome, menu, menuAltro, allergie: rsvp.allergie ?? '' })
    setAccompagnatori((rsvp.rsvp_accompagnatori ?? []).map(a => {
      const { menu: m, menuAltro: ma } = dbMenuToForm(a.menu)
      return { nome: a.nome, cognome: a.cognome, menu: m, menuAltro: ma, allergie: a.allergie ?? '' }
    }))
  }

  async function checkStatus(nome: string, cognome: string): Promise<CheckState> {
    try {
      const res = await fetch(`/api/rsvp/status?nome=${encodeURIComponent(nome)}&cognome=${encodeURIComponent(cognome)}`)
      const data = await res.json()
      if (data.status === 'principale') {
        setExistingRsvp(data.rsvp)
        populateFromExisting(data.rsvp)
      } else if (data.status === 'accompagnatore') {
        setMainGuest(data.mainGuest)
      }
      setCheckState(data.status)
      return data.status
    } catch {
      setCheckState('none')
      return 'none'
    }
  }

  useEffect(() => {
    const nome = localStorage.getItem('guest_name') || ''
    const cognome = localStorage.getItem('guest_surname') || ''
    if (nome) setPrincipale(p => ({ ...p, nome, cognome }))
    if (nome && cognome) {
      setCheckState('loading')
      checkStatus(nome, cognome)
    } else {
      setCheckState('none')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updatePrincipale(f: keyof Ospite, v: string) { setPrincipale(p => ({ ...p, [f]: v })) }
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

    if (checkState === 'none') {
      const status = await checkStatus(principale.nome.trim(), principale.cognome.trim())
      if (status === 'accompagnatore') { setLoading(false); return }
      if (status === 'principale') { setLoading(false); return }
    }

    try {
      const menuValue = partecipa ? (principale.menu === 'altro' ? (principale.menuAltro.trim() || 'altro') : principale.menu) : 'standard'
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principale: { ...principale, menu: menuValue },
          accompagnatori: accompagnatori.map(a => ({
            ...a, menu: a.menu === 'altro' ? (a.menuAltro.trim() || 'altro') : a.menu,
          })),
          partecipa,
        }),
      })
      if (res.ok) {
        localStorage.setItem('guest_name', principale.nome.trim())
        localStorage.setItem('guest_surname', principale.cognome.trim())
        if (isEditing) {
          await checkStatus(principale.nome.trim(), principale.cognome.trim())
          setIsEditing(false)
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        } else {
          setSubmitted(true)
        }
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

  const Heading = ({ children, className }: { children: React.ReactNode; className?: string }) =>
    embedded
      ? <h2 className={className}>{children}</h2>
      : <h1 className={className}>{children}</h1>

  // ── Vista: conferma dopo nuova registrazione ───────────────────────────────
  if (submitted) {
    return (
      <div className="card p-10 animate-slide-up text-center">
        <div className="w-16 h-16 rounded-full btn-sunset flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {partecipa ? (
          <>
            <p className="text-2xl sm:text-3xl font-bold text-night mb-4 font-[family-name:var(--font-lora)]">Grazie!</p>
            <p className="text-night/70 text-lg sm:text-xl leading-relaxed font-[family-name:var(--font-inter)]">
              La tua presenza è confermata.<br />Ci vediamo il 10 settembre 2027!
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl sm:text-3xl font-bold text-night mb-4 font-[family-name:var(--font-lora)]">Grazie per averci risposto</p>
            <p className="text-night/70 text-lg sm:text-xl leading-relaxed font-[family-name:var(--font-inter)]">
              Peccato non averti con noi, ma ti vogliamo bene lo stesso!
            </p>
          </>
        )}
        {!embedded && (
          <Link href="/" className="btn-sunset py-3 px-7 text-base text-center inline-block mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]">
            Torna alla home
          </Link>
        )}
      </div>
    )
  }

  // ── Vista: loading ─────────────────────────────────────────────────────────
  if (checkState === null || checkState === 'loading') {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center gap-3 text-night/50 font-[family-name:var(--font-inter)]">
          <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Controllo in corso…
        </div>
      </div>
    )
  }

  // ── Vista: accompagnatore ──────────────────────────────────────────────────
  if (checkState === 'accompagnatore' && !isEditing) {
    return (
      <div className="card p-7 animate-slide-up">
        <div className="flex items-start gap-4 mb-5">
          <span className="text-3xl leading-none mt-0.5">ℹ️</span>
          <div>
            <Heading className="text-xl font-bold text-night mb-1 font-[family-name:var(--font-lora)]">Sei già segnato/a</Heading>
            <p className="text-night/70 text-base font-[family-name:var(--font-inter)]">
              Il tuo nome è già registrato come accompagnatore/a di{' '}
              <strong className="text-night">{mainGuest?.nome} {mainGuest?.cognome}</strong>.
            </p>
          </div>
        </div>
        <p className="text-night/70 text-base mb-6 font-[family-name:var(--font-inter)]">
          Per aggiornare il tuo menu o comunicare allergie, chiedi a{' '}
          <strong className="text-night">{mainGuest?.nome}</strong> di modificare la propria registrazione,
          oppure contatta direttamente Marco &amp; Cristina.
        </p>
        {!embedded && (
          <Link href="/" className="btn-sunset py-3.5 px-7 text-base text-center inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]">
            Torna alla home
          </Link>
        )}
      </div>
    )
  }

  // ── Vista: già registrato come principale ──────────────────────────────────
  if (checkState === 'principale' && !isEditing) {
    const menuLabel = MENU.find(m => m.value === existingRsvp?.menu)?.label ?? existingRsvp?.menu ?? '-'
    return (
      <div>
        {saveSuccess && (
          <div className="mb-5 rounded-2xl bg-sunset/15 border border-sunset/30 px-5 py-3 flex items-center gap-3 animate-slide-up">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6A67D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <p className="text-night text-sm font-medium font-[family-name:var(--font-inter)]">Risposta aggiornata con successo.</p>
          </div>
        )}

        <div className="card p-7 animate-slide-up">
          <div className="flex items-start gap-4 mb-5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${existingRsvp?.partecipa ? 'bg-sunset text-white' : 'bg-night/20 text-night'}`}>
              {existingRsvp?.partecipa ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              )}
            </div>
            <div>
              <Heading className="text-xl font-bold text-night mb-0.5 font-[family-name:var(--font-lora)]">
                {existingRsvp?.partecipa ? 'Presenza confermata' : 'Hai risposto che non verrai'}
              </Heading>
              <p className="text-night/50 text-sm font-[family-name:var(--font-inter)]">
                {existingRsvp?.nome} {existingRsvp?.cognome}
              </p>
            </div>
          </div>

          {existingRsvp?.partecipa && (
            <div className="border-t border-lilac pt-5 mt-2 flex flex-col gap-2 text-base font-[family-name:var(--font-inter)]">
              <div className="flex gap-2">
                <span className="text-night/50 w-28 shrink-0">Menu</span>
                <span className="text-night capitalize">{menuLabel}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-night/50 w-28 shrink-0">Allergie</span>
                <span className="text-night">{existingRsvp.allergie || 'Nessuna'}</span>
              </div>
              {(existingRsvp.rsvp_accompagnatori?.length ?? 0) > 0 && (
                <div className="flex gap-2">
                  <span className="text-night/50 w-28 shrink-0">Accompagnatori</span>
                  <ul className="flex flex-col gap-0.5">
                    {existingRsvp.rsvp_accompagnatori.map(a => (
                      <li key={a.id} className="text-night">
                        {a.nome} {a.cognome}
                        <span className="text-night/50 text-sm"> · {MENU.find(m => m.value === a.menu)?.label ?? a.menu}</span>
                        {a.allergie && <span className="text-night/50 text-sm"> · {a.allergie}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => setIsEditing(true)}
              className="btn-sunset py-3 px-6 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]">
              Modifica risposta
            </button>
            {!embedded && (
              <Link href="/"
                className="border-2 border-night/30 text-night rounded-2xl py-3 px-6 text-base font-semibold hover:border-sunset transition-colors font-[family-name:var(--font-inter)]">
                Torna alla home
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Vista: form (nuovo ospite o modifica) ─────────────────────────────────
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        {isEditing && (
          <button onClick={() => setIsEditing(false)}
            className="text-night/50 hover:text-night transition-colors font-[family-name:var(--font-inter)] text-sm flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Indietro
          </button>
        )}
      </div>
      <Heading className="text-2xl sm:text-3xl font-bold text-night mb-3 font-[family-name:var(--font-lora)]">
        {isEditing ? 'Modifica la tua risposta' : 'Conferma la tua presenza'}
      </Heading>
      <p className="text-night/60 text-base sm:text-lg mb-8 leading-relaxed font-[family-name:var(--font-inter)]">
        {isEditing
          ? 'Aggiorna i tuoi dati e clicca "Salva modifiche".'
          : 'Dicci se ci sarai! Compila il modulo e clicca "Invia".'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button type="button" onClick={() => setPartecipa(true)}
            className={`py-5 rounded-2xl text-lg font-semibold transition-all duration-200 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)] ${
              partecipa ? 'bg-sunset border-2 border-night text-night shadow-sm hover:bg-sunset/90' : 'bg-white border-2 border-night/30 text-night hover:border-sunset'
            }`}>
            Ci sono!
          </button>
          <button type="button" onClick={() => { setPartecipa(false); setAccompagnatori([]) }}
            className={`py-5 rounded-2xl text-lg font-semibold transition-all duration-200 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)] ${
              !partecipa ? 'bg-night text-white shadow-md' : 'bg-white border-2 border-night/30 text-night hover:border-night'
            }`}>
            Purtroppo no
          </button>
        </div>

        <hr className="border-night/10" />

        <div>
          <p className="text-night text-base font-semibold mb-3 font-[family-name:var(--font-inter)]">I tuoi dati</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-night/60 text-sm block mb-1.5 font-[family-name:var(--font-inter)]">Nome</label>
              <input type="text" value={principale.nome} onChange={e => updatePrincipale('nome', e.target.value)}
                placeholder="Nome" required className={inputCls} autoComplete="given-name" />
            </div>
            <div>
              <label className="text-night/60 text-sm block mb-1.5 font-[family-name:var(--font-inter)]">Cognome</label>
              <input type="text" value={principale.cognome} onChange={e => updatePrincipale('cognome', e.target.value)}
                placeholder="Cognome" required className={inputCls} autoComplete="family-name" />
            </div>
          </div>
        </div>

        {partecipa && (
          <>
            <hr className="border-night/10" />
            <MenuAllergie ospite={principale} onChange={updatePrincipale} prefix="principale" />
            {accompagnatori.length > 0 && <hr className="border-night/10" />}
            {accompagnatori.map((acc, i) => (
              <AccompagnatoreCard key={i} ospite={acc} index={i}
                onChange={(f, v) => updateAcc(i, f, v)}
                onRemove={() => setAccompagnatori(a => a.filter((_, idx) => idx !== i))} />
            ))}
            <button type="button" onClick={() => setAccompagnatori(a => [...a, newOspite()])}
              className="border-2 border-dashed border-sunset text-sunset rounded-2xl py-4 text-base font-semibold hover:bg-sunset/10 motion-safe:hover:scale-[1.01] motion-safe:active:scale-[0.99] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]">
              + Aggiungi un accompagnatore
            </button>
          </>
        )}

        {error && (
          <p role="alert" className="text-red-600 text-base font-medium text-center font-[family-name:var(--font-inter)]">{error}</p>
        )}

        <button type="submit" disabled={loading}
          className="btn-sunset py-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]">
          {loading ? 'Invio in corso…' : isEditing ? 'Salva modifiche' : 'Invia'}
        </button>
      </form>
    </div>
  )
}
