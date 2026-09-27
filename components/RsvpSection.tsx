'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// ── Tipi ──────────────────────────────────────────────────────────────────────

type Preferenza = '' | 'vegano' | 'vegetariano' | 'no-carne' | 'no-pesce'

type Ospite = {
  nome: string
  cognome: string
  bambino: boolean
  preferenza: Preferenza          // '' = menu standard
  menuBambino: 'bambino' | 'senza'
  allergie: string
}

type AccompagnatoreDb = { id: string; rsvp_id: string; nome: string; cognome: string; menu: string; allergie: string | null }
type ExistingRsvp = { id: string; nome: string; cognome: string; partecipa: boolean; menu: string; allergie: string | null; rsvp_accompagnatori: AccompagnatoreDb[] }
type CheckState = 'loading' | 'none' | 'principale' | 'accompagnatore'

// ── Costanti menu ───────────────────────────────────────────────────────────

const PREFERENZE: { value: Exclude<Preferenza, ''>; label: string }[] = [
  { value: 'vegano',      label: 'Vegano' },
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'no-carne',    label: 'Non mangio carne' },
  { value: 'no-pesce',    label: 'Non mangio pesce' },
]

const PREF_TO_DB: Record<Exclude<Preferenza, ''>, string> = {
  vegano: 'vegano',
  vegetariano: 'vegetariano',
  'no-carne': 'non mangio carne',
  'no-pesce': 'non mangio pesce',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const newOspite = (): Ospite => ({ nome: '', cognome: '', bambino: false, preferenza: '', menuBambino: 'bambino', allergie: '' })

// Traduce lo stato del form nella stringa salvata a DB
function ospiteToMenu(o: Ospite): string {
  if (o.bambino) return o.menuBambino === 'senza' ? 'senza menu' : 'menu bambino'
  if (o.preferenza) return PREF_TO_DB[o.preferenza]
  return 'standard'
}

// Interpreta la stringa a DB per ripopolare il form in modifica
function parseMenu(menu: string): Pick<Ospite, 'bambino' | 'preferenza' | 'menuBambino'> {
  const m = (menu || '').trim().toLowerCase()
  if (m === 'menu bambino') return { bambino: true, preferenza: '', menuBambino: 'bambino' }
  if (m === 'senza menu')   return { bambino: true, preferenza: '', menuBambino: 'senza' }
  const entry = (Object.entries(PREF_TO_DB) as [Exclude<Preferenza, ''>, string][]).find(([, db]) => db === m)
  if (entry) return { bambino: false, preferenza: entry[0], menuBambino: 'bambino' }
  return { bambino: false, preferenza: '', menuBambino: 'bambino' }
}

// Etichetta leggibile per la vista di riepilogo
function menuDisplay(menu?: string | null): string {
  const raw = (menu || '').trim()
  const m = raw.toLowerCase()
  if (!m || m === 'standard') return 'Menu standard'
  if (m === 'menu bambino') return 'Menu bambino'
  if (m === 'senza menu') return 'Senza menu'
  if (m.startsWith('altro:')) return raw.slice(raw.indexOf(':') + 1).trim() || 'Altro'
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

const inputCls = "border-2 border-night/60 rounded-xl px-4 py-3.5 text-lg outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 transition-all w-full placeholder:text-night/30 font-[family-name:var(--font-inter)]"

// ── Sub-componenti ────────────────────────────────────────────────────────────

// Sezione richiudibile ("radio a scomparsa"): parte aperta se ha già un valore
function Collapsible({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(active)
  return (
    <div className="border-2 border-night/25 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-night font-semibold text-base hover:bg-night/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-inset font-[family-name:var(--font-inter)]"
      >
        <svg className={`w-5 h-5 shrink-0 text-sunset transition-transform duration-200 ${open ? 'rotate-45' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>{label}</span>
        {active && <span className="ml-auto w-2 h-2 rounded-full bg-sunset shrink-0" aria-hidden="true" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pt-1">{children}</div>
      </div>
    </div>
  )
}

function MenuAllergie({ ospite, onChange, isChild, prefix }: {
  ospite: Ospite
  onChange: <K extends keyof Ospite>(f: K, v: Ospite[K]) => void
  isChild: boolean
  prefix: string
}) {
  return (
    <div className="flex flex-col gap-3">
      {isChild ? (
        <div>
          <p className="text-night text-base font-semibold mb-3 font-[family-name:var(--font-inter)]">Menu per il bambino/a</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {([{ value: 'bambino', label: 'Menu bambino' }, { value: 'senza', label: 'Senza menu' }] as const).map(opt => (
              <label key={opt.value}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-colors duration-150 hover:border-sunset ${
                  ospite.menuBambino === opt.value ? 'border-sunset bg-sunset/10' : 'border-night/40'
                }`}>
                <input type="radio" name={`menub-${prefix}`} value={opt.value}
                  checked={ospite.menuBambino === opt.value}
                  onChange={() => onChange('menuBambino', opt.value)}
                  className="w-5 h-5 accent-sunset shrink-0" />
                <span className="text-base font-[family-name:var(--font-inter)]">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p className="text-night/70 text-sm sm:text-base leading-relaxed font-[family-name:var(--font-inter)]">
            Per tutti è previsto il nostro <strong className="text-night">menu completo</strong>. Se hai esigenze
            particolari aggiungile qui sotto, altrimenti non devi fare nulla.
          </p>
          <Collapsible label="Ho una preferenza alimentare" active={ospite.preferenza !== ''}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PREFERENZE.map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors duration-150 hover:border-sunset ${
                    ospite.preferenza === opt.value ? 'border-sunset bg-sunset/10' : 'border-night/40'
                  }`}>
                  <input type="radio" name={`pref-${prefix}`} value={opt.value}
                    checked={ospite.preferenza === opt.value}
                    onChange={() => onChange('preferenza', opt.value)}
                    className="w-5 h-5 accent-sunset shrink-0" />
                  <span className="text-base font-[family-name:var(--font-inter)]">{opt.label}</span>
                </label>
              ))}
            </div>
            {ospite.preferenza && (
              <button type="button" onClick={() => onChange('preferenza', '')}
                className="mt-3 text-night/60 underline text-sm hover:text-night transition-colors font-[family-name:var(--font-inter)]">
                Nessuna preferenza (torna al menu standard)
              </button>
            )}
          </Collapsible>
        </>
      )}

      <Collapsible label="Ho un'allergia o un'intolleranza" active={ospite.allergie.trim() !== ''}>
        <input type="text" placeholder="Es. glutine, lattosio, frutta a guscio…"
          value={ospite.allergie} onChange={e => onChange('allergie', e.target.value)} className={inputCls} />
      </Collapsible>
    </div>
  )
}

function AccompagnatoreCard({ ospite, index, onChange, onRemove }: {
  ospite: Ospite; index: number; onChange: <K extends keyof Ospite>(f: K, v: Ospite[K]) => void; onRemove: () => void
}) {
  return (
    <div className="border-2 border-night/30 rounded-2xl p-5 flex flex-col gap-4 animate-slide-up">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full btn-sunset flex items-center justify-center text-sm font-bold font-[family-name:var(--font-inter)]">{index + 1}</span>
          <h3 className="text-lg font-semibold text-night font-[family-name:var(--font-lora)]">Accompagnatore</h3>
        </div>
        <button type="button" onClick={onRemove}
          className="text-night/60 underline text-base hover:text-night transition-colors font-[family-name:var(--font-inter)]">
          Rimuovi
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" placeholder="Nome" value={ospite.nome}
          onChange={e => onChange('nome', e.target.value)} required className={inputCls} />
        <input type="text" placeholder="Cognome" value={ospite.cognome}
          onChange={e => onChange('cognome', e.target.value)} required className={inputCls} />
      </div>

      {/* Flag bambino: cambia le opzioni di menu */}
      <label className="flex items-center gap-3 cursor-pointer select-none py-1">
        <input type="checkbox" checked={ospite.bambino}
          onChange={e => onChange('bambino', e.target.checked)}
          className="w-5 h-5 accent-sunset shrink-0" />
        <span className="text-night text-base font-[family-name:var(--font-inter)]">È un bambino/a</span>
      </label>

      <MenuAllergie ospite={ospite} onChange={onChange} isChild={ospite.bambino} prefix={`acc-${index}`} />
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
    const p = parseMenu(rsvp.menu)
    // Il principale è sempre un adulto
    setPrincipale({ nome: rsvp.nome, cognome: rsvp.cognome, bambino: false, preferenza: p.preferenza, menuBambino: 'bambino', allergie: rsvp.allergie ?? '' })
    setAccompagnatori((rsvp.rsvp_accompagnatori ?? []).map(a => ({
      nome: a.nome, cognome: a.cognome, ...parseMenu(a.menu), allergie: a.allergie ?? '',
    })))
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

  function updatePrincipale<K extends keyof Ospite>(f: K, v: Ospite[K]) { setPrincipale(p => ({ ...p, [f]: v })) }
  function updateAcc<K extends keyof Ospite>(i: number, f: K, v: Ospite[K]) {
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
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principale: {
            nome: principale.nome.trim(),
            cognome: principale.cognome.trim(),
            menu: ospiteToMenu(principale),
            allergie: principale.allergie,
          },
          accompagnatori: accompagnatori.map(a => ({
            nome: a.nome,
            cognome: a.cognome,
            menu: ospiteToMenu(a),
            allergie: a.allergie,
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
        <div className="mb-5">
          <Heading className="text-xl font-bold text-night mb-1 font-[family-name:var(--font-lora)]">Sei già segnato/a</Heading>
          <p className="text-night/70 text-base font-[family-name:var(--font-inter)]">
            Il tuo nome è già registrato come accompagnatore/a di{' '}
            <strong className="text-night">{mainGuest?.nome} {mainGuest?.cognome}</strong>.
          </p>
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${existingRsvp?.partecipa ? 'bg-sunset text-night' : 'bg-night/20 text-night'}`}>
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
            <div className="border-t border-lilac pt-5 mt-2 flex flex-col gap-5 font-[family-name:var(--font-inter)]">
              {/* I tuoi dati */}
              <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2 text-base">
                <dt className="text-night/50">Menu</dt>
                <dd className="text-night break-words">{menuDisplay(existingRsvp.menu)}</dd>
                <dt className="text-night/50">Allergie</dt>
                <dd className="text-night break-words">{existingRsvp.allergie || 'Nessuna'}</dd>
              </dl>

              {/* Accompagnatori */}
              {(existingRsvp.rsvp_accompagnatori?.length ?? 0) > 0 && (
                <div>
                  <p className="text-night/50 text-xs uppercase tracking-[0.14em] mb-2">
                    Accompagnatori ({existingRsvp.rsvp_accompagnatori.length})
                  </p>
                  <ul className="flex flex-col gap-2">
                    {existingRsvp.rsvp_accompagnatori.map(a => (
                      <li key={a.id} className="rounded-xl border border-night/10 bg-night/[0.03] px-4 py-3">
                        <p className="text-night font-semibold break-words">{a.nome} {a.cognome}</p>
                        <p className="text-night/60 text-sm mt-0.5 break-words">
                          {menuDisplay(a.menu)}{a.allergie ? ` · ${a.allergie}` : ''}
                        </p>
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
            <MenuAllergie ospite={principale} onChange={updatePrincipale} isChild={false} prefix="principale" />
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
          <p role="alert" className="text-error text-base font-medium text-center font-[family-name:var(--font-inter)]">{error}</p>
        )}

        <button type="submit" disabled={loading}
          className="btn-sunset py-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-night focus-visible:ring-offset-2 font-[family-name:var(--font-inter)]">
          {loading ? 'Invio in corso…' : isEditing ? 'Salva modifiche' : 'Invia'}
        </button>
      </form>
    </div>
  )
}
