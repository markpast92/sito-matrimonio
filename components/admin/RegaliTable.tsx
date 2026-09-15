'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Regalo = { id: string; created_at: string; nome: string | null; email: string; importo: number | null; messaggio: string | null }

const inputCls = 'border border-lilac rounded-lg px-3 py-2 text-sm outline-none focus:border-sunset w-full'
const btnDanger = 'px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors'
const btnNeutral = 'px-3 py-1.5 rounded-lg text-sm font-medium bg-lilac text-night hover:bg-lilac/70 transition-colors'
const btnSunset = 'px-4 py-2 rounded-xl text-sm font-semibold bg-sunset text-white hover:bg-sunset/80 transition-colors disabled:opacity-50'

export default function RegaliTable({ regali, totImporti }: { regali: Regalo[]; totImporti: number }) {
  const router = useRouter()
  const [editTarget, setEditTarget] = useState<Regalo | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmClear2, setConfirmClear2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [fNome, setFNome] = useState('')
  const [fEmail, setFEmail] = useState('')
  const [fImporto, setFImporto] = useState('')
  const [fMessaggio, setFMessaggio] = useState('')

  function openEdit(r: Regalo) {
    setFNome(r.nome ?? '')
    setFEmail(r.email)
    setFImporto(r.importo != null ? String(r.importo) : '')
    setFMessaggio(r.messaggio ?? '')
    setError('')
    setEditTarget(r)
  }

  function closeEdit() { setEditTarget(null); setError('') }

  async function saveEdit() {
    if (!fEmail.trim()) { setError('Email obbligatoria'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/admin/regalo/${editTarget!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: fNome, email: fEmail, importo: fImporto, messaggio: fMessaggio }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Errore'); return }
      closeEdit()
      router.refresh()
    } catch { setError('Errore di rete') }
    finally { setLoading(false) }
  }

  async function deleteRegalo(id: string) {
    setLoading(true)
    try {
      await fetch(`/api/admin/regalo/${id}`, { method: 'DELETE' })
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
        body: JSON.stringify({ table: 'regali' }),
      })
      setConfirmClear(false); setConfirmClear2(false)
      router.refresh()
    } finally { setLoading(false) }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-lg sm:text-2xl font-bold text-night">
          Regali{totImporti > 0 && <span className="text-sunset font-normal"> — Totale dichiarato: €{totImporti}</span>}
        </h2>
        {regali.length > 0 && (
          <button onClick={() => setConfirmClear(true)} className={btnDanger}>
            Svuota tabella Regali
          </button>
        )}
      </div>

      {regali.length === 0 ? (
        <p className="text-dust text-lg font-[family-name:var(--font-inter)]">Nessuna richiesta regalo ancora.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-base">
            <thead>
              <tr className="bg-night text-white">
                <th className="p-3 sm:p-4">Nome</th>
                <th className="p-3 sm:p-4">Email</th>
                <th className="p-3 sm:p-4">Importo</th>
                <th className="p-3 sm:p-4">Messaggio</th>
                <th className="p-3 sm:p-4">Data</th>
                <th className="p-3 sm:p-4">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {regali.map(r => (
                <tr key={r.id} className="border-t border-lilac">
                  <td className="p-3 sm:p-4">{r.nome || '—'}</td>
                  <td className="p-3 sm:p-4">{r.email}</td>
                  <td className="p-3 sm:p-4">{r.importo != null ? `€${r.importo}` : '—'}</td>
                  <td className="p-3 sm:p-4 text-dust max-w-xs truncate font-[family-name:var(--font-inter)]">{r.messaggio || '—'}</td>
                  <td className="p-3 sm:p-4 text-dust font-[family-name:var(--font-inter)]">
                    {new Date(r.created_at).toLocaleDateString('it-IT')}
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
              Sei sicuro di voler eliminare questa richiesta regalo?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDeleteId(null)} className={btnNeutral}>Annulla</button>
              <button onClick={() => deleteRegalo(confirmDeleteId)} disabled={loading} className={btnDanger}>
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
            <h3 className="text-lg font-bold text-night mb-3">Svuota tabella Regali</h3>
            <p className="text-dust mb-6 font-[family-name:var(--font-inter)]">
              Stai per eliminare tutte le {regali.length} richieste regalo. Sei sicuro?
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
              Questa operazione è irreversibile. Tutte le richieste regalo verranno cancellate definitivamente.
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

      {/* Modal: edit regalo */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-lg font-bold text-night mb-5">
              Modifica Regalo — {editTarget.nome || editTarget.email}
            </h3>

            <div className="flex flex-col gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-night mb-1">Nome</label>
                <input value={fNome} onChange={e => setFNome(e.target.value)} className={inputCls} placeholder="Nome e cognome" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-night mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-night mb-1">Importo (€)</label>
                <input type="number" value={fImporto} onChange={e => setFImporto(e.target.value)} className={inputCls} placeholder="Es. 50" min="1" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-night mb-1">Messaggio</label>
                <textarea value={fMessaggio} onChange={e => setFMessaggio(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
              </div>
            </div>

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
