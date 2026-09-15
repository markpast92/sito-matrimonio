'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'

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

const inputCls = "border-2 border-lilac rounded-xl px-4 py-3.5 text-lg outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all w-full placeholder:text-dust/50 font-[family-name:var(--font-inter)]"

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
                ospite.menu === opt.value ? 'border-sunset bg-gradient-to-r from-sunset/10 to-lilac/10' : 'border-lilac'
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
          Allergie o intolleranze <span className="text-dust font-normal">(facoltativo)</span>
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
    <div className="border-2 border-lilac rounded-2xl p-5 flex flex-col gap-4 animate-slide-up">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full btn-sunset flex items-center justify-center text-sm font-bold font-[family-name:var(--font-inter)]">{index + 1}</span>
          <h3 className="text-lg font-semibold text-night">Accompagnatore</h3>
        </div>
        <button type="button" onClick={onRemove}
          className="text-dust underline text-base hover:text-night transition-colors font-[family-name:var(--font-inter)]">
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

// ── Pagina principale ─────────────────────────────────────────────────────────

export default function RSVPPage() {
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

  // Popola il form con i dati dal DB
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

    // Nuovo ospite (checkState === 'none') → verifica prima che non sia un accompagnatore
    if (checkState === 'none') {
      const status = await checkStatus(principale.nome.trim(), principale.cognome.trim())
      if (status === 'accompagnatore') { setLoading(false); return }
      // Se 'principale' → mostriamo i dati esistenti invece di sovrascrivere silenziosamente
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
          // Ricarica i dati aggiornati e torna alla vista riepilogo
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

  // ── Vista: schermata di conferma dopo nuova registrazione ──────────────────
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

  // ── Vista: loading (check DB in corso) ────────────────────────────────────
  if (checkState === null || checkState === 'loading') {
    return (
      <>
        <Nav />
        <div className="bg-page-top h-24 -mb-24 pointer-events-none" />
        <main className="max-w-2xl mx-auto px-5 py-10 flex justify-center items-center min-h-[40vh]">
          <div className="flex items-center gap-3 text-dust font-[family-name:var(--font-inter)]">
            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Controllo in corso…
          </div>
        </main>
      </>
    )
  }

  // ── Vista: sei un accompagnatore ──────────────────────────────────────────
  if (checkState === 'accompagnatore' && !isEditing) {
    return (
      <>
        <Nav />
        <div className="bg-page-top h-24 -mb-24 pointer-events-none" />
        <main className="max-w-2xl mx-auto px-5 py-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-night mb-8">Conferma la tua presenza</h1>
          <div className="card p-7 animate-slide-up">
            <div className="flex items-start gap-4 mb-5">
              <span className="text-3xl leading-none mt-0.5">ℹ️</span>
              <div>
                <h2 className="text-xl font-bold text-night mb-1">Sei già segnato/a</h2>
                <p className="text-dust text-base font-[family-name:var(--font-inter)]">
                  Il tuo nome è già registrato come accompagnatore/a di{' '}
                  <strong className="text-night">{mainGuest?.nome} {mainGuest?.cognome}</strong>.
                </p>
              </div>
            </div>
            <p className="text-dust text-base mb-6 font-[family-name:var(--font-inter)]">
              Per aggiornare il tuo menu o comunicare allergie, chiedi a{' '}
              <strong className="text-night">{mainGuest?.nome}</strong> di modificare la propria registrazione,
              oppure contatta direttamente Marco &amp; Cristina.
            </p>
            <Link href="/" className="btn-sunset py-3.5 px-7 text-base text-center inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]">
              Torna alla home
            </Link>
          </div>
        </main>
      </>
    )
  }

  // ── Vista: già registrato come principale ──────────────────────────────────
  if (checkState === 'principale' && !isEditing) {
    const menuLabel = MENU.find(m => m.value === existingRsvp?.menu)?.label ?? existingRsvp?.menu ?? '—'
    return (
      <>
        <Nav />
        <div className="bg-page-top h-24 -mb-24 pointer-events-none" />
        <main className="max-w-2xl mx-auto px-5 py-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-night mb-8">Conferma la tua presenza</h1>

          {saveSuccess && (
            <div className="mb-5 rounded-2xl bg-sunset/15 border border-sunset/30 px-5 py-3 flex items-center gap-3 animate-slide-up">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6A67D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <p className="text-night text-sm font-medium font-[family-name:var(--font-inter)]">Risposta aggiornata con successo.</p>
            </div>
          )}

          <div className="card p-7 animate-slide-up">
            <div className="flex items-start gap-4 mb-5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${existingRsvp?.partecipa ? 'bg-sunset text-white' : 'bg-dust/30 text-night'}`}>
                {existingRsvp?.partecipa ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-night mb-0.5">
                  {existingRsvp?.partecipa ? 'Presenza confermata' : 'Hai risposto che non verrai'}
                </h2>
                <p className="text-dust text-sm font-[family-name:var(--font-inter)]">
                  {existingRsvp?.nome} {existingRsvp?.cognome}
                </p>
              </div>
            </div>

            {existingRsvp?.partecipa && (
              <div className="border-t border-lilac pt-5 mt-2 flex flex-col gap-2 text-base font-[family-name:var(--font-inter)]">
                <div className="flex gap-2">
                  <span className="text-dust w-28 shrink-0">Menu</span>
                  <span className="text-night capitalize">{menuLabel}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-dust w-28 shrink-0">Allergie</span>
                  <span className="text-night">{existingRsvp.allergie || 'Nessuna'}</span>
                </div>
                {(existingRsvp.rsvp_accompagnatori?.length ?? 0) > 0 && (
                  <div className="flex gap-2">
                    <span className="text-dust w-28 shrink-0">Accompagnatori</span>
                    <ul className="flex flex-col gap-0.5">
                      {existingRsvp.rsvp_accompagnatori.map(a => (
                        <li key={a.id} className="text-night">
                          {a.nome} {a.cognome}
                          <span className="text-dust text-sm"> · {MENU.find(m => m.value === a.menu)?.label ?? a.menu}</span>
                          {a.allergie && <span className="text-dust text-sm"> · {a.allergie}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={() => setIsEditing(true)}
                className="btn-sunset py-3 px-6 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]">
                Modifica risposta
              </button>
              <Link href="/"
                className="border-2 border-lilac text-night rounded-2xl py-3 px-6 text-base font-semibold hover:border-sunset transition-colors font-[family-name:var(--font-inter)]">
                Torna alla home
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  // ── Vista: form (nuovo ospite o modifica) ─────────────────────────────────
  return (
    <>
      <Nav />
      <div className="bg-page-top h-24 -mb-24 pointer-events-none" />

      <main className="max-w-2xl mx-auto px-5 py-10">
        <div className="flex items-center gap-3 mb-3">
          {isEditing && (
            <button onClick={() => setIsEditing(false)}
              className="text-dust hover:text-night transition-colors font-[family-name:var(--font-inter)] text-sm flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Indietro
            </button>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-night mb-3">
          {isEditing ? 'Modifica la tua risposta' : 'Conferma la tua presenza'}
        </h1>
        <p className="text-dust text-base sm:text-lg mb-8 leading-relaxed font-[family-name:var(--font-inter)]">
          {isEditing
            ? 'Aggiorna i tuoi dati e clicca "Salva modifiche".'
            : 'Dicci se ci sarai! Compila il modulo e clicca "Invia".'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button type="button" onClick={() => setPartecipa(true)}
              className={`py-5 rounded-2xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset focus-visible:ring-offset-2 font-[family-name:var(--font-inter)] ${
                partecipa ? 'btn-sunset' : 'bg-white border-2 border-lilac text-night hover:border-sunset'
              }`}>
              Ci sono!
            </button>
            <button type="button" onClick={() => { setPartecipa(false); setAccompagnatori([]) }}
              className={`py-5 rounded-2xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dust focus-visible:ring-offset-2 font-[family-name:var(--font-inter)] ${
                !partecipa ? 'bg-dust text-white shadow-md' : 'bg-white border-2 border-lilac text-night hover:border-dust'
              }`}>
              Purtroppo no
            </button>
          </div>

          <hr className="border-lilac" />

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
            {loading ? 'Invio in corso…' : isEditing ? 'Salva modifiche' : 'Invia'}
          </button>
        </form>
      </main>
    </>
  )
}
