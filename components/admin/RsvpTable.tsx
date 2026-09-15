'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Accompagnatore = { id: string; nome: string; cognome: string; menu: string; allergie: string | null }
type Rsvp = { id: string; created_at: string; nome: string; cognome: string; partecipa: boolean; menu: string; allergie: string | null; rsvp_accompagnatori: Accompagnatore[] }

type AccForm = { nome: string; cognome: string; menu: string; allergie: string }

const MENU_OPTIONS = ['standard', 'vegetariano', 'vegano', 'altro']

const inputCls = 'border border-lilac rounded-lg px-3 py-2 text-sm outline-none focus:border-sunset w-full'
const btnDanger = 'px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors'
const btnNeutral = 'px-3 py-1.5 rounded-lg text-sm font-medium bg-lilac text-night hover:bg-lilac/70 transition-colors'
const btnSunset = 'px-4 py-2 rounded-xl text-sm font-semibold bg-sunset text-white hover:bg-sunset/80 transition-colors disabled:opacity-50'

export default function RsvpTable({ rsvps }: { rsvps: Rsvp[] }) {
  const router = useRouter()
  const [editTarget, setEditTarget] = useState<Rsvp | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmClear2, setConfirmClear2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state per edit modal
  const [fNome, setFNome] = useState('')
  const [fCognome, setFCognome] = useState('')
  const [fPartecipa, setFPartecipa] = useState(true)
  const [fMenu, setFMenu] = useState('standard')
  const [fAllergie, setFAllergie] = useState('')
  const [fAccomp, setFAccomp] = useState<AccForm[]>([])

  function openEdit(r: Rsvp) {
    setFNome(r.nome)
    setFCognome(r.cognome)
    setFPartecipa(r.partecipa)
    setFMenu(r.menu)
    setFAllergie(r.allergie ?? '')
    setFAccomp((r.rsvp_accompagnatori ?? []).map(a => ({
      nome: a.nome, cognome: a.cognome, menu: a.menu, allergie: a.allergie ?? ''
    })))
    setError('')
    setEditTarget(r)
  }

  function closeEdit() { setEditTarget(null); setError('') }

  function addAccomp() {
    setFAccomp(prev => [...prev, { nome: '', cognome: '', menu: 'standard', allergie: '' }])
  }

  function removeAccomp(i: number) {
    setFAccomp(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateAccomp(i: number, field: keyof AccForm, value: string) {
    setFAccomp(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a))
  }

  async function saveEdit() {
    if (!fNome.trim() || !fCognome.trim()) { setError('Nome e cognome obbligatori'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/admin/rsvp/${editTarget!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: fNome, cognome: fCognome, partecipa: fPartecipa, menu: fMenu, allergie: fAllergie, accompagnatori: fAccomp }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Errore'); return }
      closeEdit()
      router.refresh()
    } catch { setError('Errore di rete') }
    finally { setLoading(false) }
  }

  async function deleteRsvp(id: string) {
    setLoading(true)
    try {
      await fetch(`/api/admin/rsvp/${id}`, { method: 'DELETE' })
      setConfirmDeleteId(null)
      router.refresh()
    } finally { setLoading(false) }
  }

  async function clearAll() {
    setLoading(true)
    try {
      await fetch('/api/admin/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'rsvp' }),
      })
      setConfirmClear(false); setConfirmClear2(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-lg sm:text-2xl font-bold text-night">Presenze</h2>
        {rsvps.length > 0 && (
          <button onClick={() => setConfirmClear(true)} className={btnDanger}>
            Svuota tabella RSVP
          </button>
        )}
      </div>

      {rsvps.length === 0 ? (
        <p className="text-dust text-lg mb-12 font-[family-name:var(--font-inter)]">Nessun RSVP ancora.</p>
      ) : (
        <div className="card overflow-x-auto mb-12">
          <table className="w-full text-left text-sm sm:text-base">
            <thead>
              <tr className="bg-night text-white">
                <th className="p-3 sm:p-4">Nome</th>
                <th className="p-3 sm:p-4">Cognome</th>
                <th className="p-3 sm:p-4">Partecipa</th>
                <th className="p-3 sm:p-4">Menu</th>
                <th className="p-3 sm:p-4">Allergie</th>
                <th className="p-3 sm:p-4">Accompagnatori</th>
                <th className="p-3 sm:p-4">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map(r => (
                <tr key={r.id} className="border-t border-lilac">
                  <td className="p-3 sm:p-4 font-medium">{r.nome}</td>
                  <td className="p-3 sm:p-4">{r.cognome}</td>
                  <td className="p-3 sm:p-4">{r.partecipa ? 'Sì' : 'No'}</td>
                  <td className="p-3 sm:p-4 capitalize">{r.menu}</td>
                  <td className="p-3 sm:p-4 text-dust">{r.allergie || '—'}</td>
                  <td className="p-3 sm:p-4">
                    {r.rsvp_accompagnatori?.length > 0 ? (
                      <ul className="list-disc list-inside text-xs sm:text-sm">
                        {r.rsvp_accompagnatori.map(a => (
                          <li key={a.id}>{a.nome} {a.cognome} · {a.menu}{a.allergie ? ` · ${a.allergie}` : ''}</li>
                        ))}
                      </ul>
                    ) : '—'}
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => openEdit(r)} className={btnNeutral}>Modifica</button>
                      <button onClick={() => setConfirmDeleteId(r.id)} className={btnDanger}>Elimina</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: conferma delete singolo */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-night mb-3">Elimina record</h3>
            <p className="text-dust mb-6 font-[family-name:var(--font-inter)]">
              Sei sicuro di voler eliminare questo RSVP? Verranno eliminati anche tutti gli accompagnatori.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDeleteId(null)} className={btnNeutral}>Annulla</button>
              <button onClick={() => deleteRsvp(confirmDeleteId)} disabled={loading} className={btnDanger}>
                {loading ? 'Elimino...' : 'Sì, elimina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: prima conferma svuota */}
      {confirmClear && !confirmClear2 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-night mb-3">Svuota tabella RSVP</h3>
            <p className="text-dust mb-6 font-[family-name:var(--font-inter)]">
              Stai per eliminare tutti i {rsvps.length} RSVP e tutti i loro accompagnatori. Sei sicuro?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmClear(false)} className={btnNeutral}>Annulla</button>
              <button onClick={() => setConfirmClear2(true)} className={btnDanger}>Sì, continua</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: seconda conferma svuota */}
      {confirmClear2 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-red-700 mb-3">Ultima conferma</h3>
            <p className="text-dust mb-6 font-[family-name:var(--font-inter)]">
              Questa operazione è irreversibile. Tutti i dati RSVP verranno cancellati definitivamente.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setConfirmClear(false); setConfirmClear2(false) }} className={btnNeutral}>Annulla</button>
              <button onClick={clearAll} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                {loading ? 'Elimino...' : 'Elimina tutto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: edit RSVP */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl my-8">
            <h3 className="text-lg font-bold text-night mb-5">
              Modifica RSVP — {editTarget.nome} {editTarget.cognome}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-night mb-1">Nome</label>
                <input value={fNome} onChange={e => setFNome(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-night mb-1">Cognome</label>
                <input value={fCognome} onChange={e => setFCognome(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-night mb-2">Partecipa</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={fPartecipa} onChange={() => setFPartecipa(true)} /> Sì
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!fPartecipa} onChange={() => setFPartecipa(false)} /> No
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-night mb-1">Menu</label>
                <select value={fMenu} onChange={e => setFMenu(e.target.value)} className={inputCls}>
                  {MENU_OPTIONS.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-night mb-1">Allergie</label>
                <input value={fAllergie} onChange={e => setFAllergie(e.target.value)} className={inputCls} placeholder="Nessuna" />
              </div>
            </div>

            {fPartecipa && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-night">Accompagnatori</label>
                  <button onClick={addAccomp} className={btnNeutral}>+ Aggiungi</button>
                </div>
                {fAccomp.length === 0 && (
                  <p className="text-dust text-sm font-[family-name:var(--font-inter)]">Nessun accompagnatore.</p>
                )}
                {fAccomp.map((a, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto_1fr_auto] gap-2 mb-2 items-center">
                    <input value={a.nome} onChange={e => updateAccomp(i, 'nome', e.target.value)} placeholder="Nome" className={inputCls} />
                    <input value={a.cognome} onChange={e => updateAccomp(i, 'cognome', e.target.value)} placeholder="Cognome" className={inputCls} />
                    <select value={a.menu} onChange={e => updateAccomp(i, 'menu', e.target.value)} className={inputCls}>
                      {MENU_OPTIONS.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
                    </select>
                    <input value={a.allergie} onChange={e => updateAccomp(i, 'allergie', e.target.value)} placeholder="Allergie" className={inputCls} />
                    <button onClick={() => removeAccomp(i)} className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">✕</button>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex gap-3 justify-end">
              <button onClick={closeEdit} className={btnNeutral}>Annulla</button>
              <button onClick={saveEdit} disabled={loading} className={btnSunset}>
                {loading ? 'Salvo...' : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
