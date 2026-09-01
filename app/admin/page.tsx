import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'

type Accompagnatore = { id: string; nome: string; cognome: string; menu: string; allergie: string | null }
type Rsvp = { id: string; created_at: string; nome: string; cognome: string; partecipa: boolean; menu: string; allergie: string | null; rsvp_accompagnatori: Accompagnatore[] }
type Regalo = { id: string; created_at: string; nome: string | null; email: string; importo: number | null; messaggio: string | null }

async function getData() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const [{ data: rsvps, error: e1 }, { data: regali, error: e2 }] = await Promise.all([
    db.from('rsvp').select('*, rsvp_accompagnatori(*)').order('created_at', { ascending: false }),
    db.from('regali').select('*').order('created_at', { ascending: false }),
  ])
  if (e1 || e2) throw new Error('Errore lettura Supabase — hai eseguito schema.sql?')
  return { rsvps: (rsvps || []) as Rsvp[], regali: (regali || []) as Regalo[] }
}

function Badge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-2xl p-5 text-center`}>
      <p className="text-3xl sm:text-4xl font-bold">{value}</p>
      <p className="text-sm sm:text-base mt-1 font-[family-name:var(--font-inter)]">{label}</p>
    </div>
  )
}

export default async function AdminPage() {
  let rsvps: Rsvp[] = []
  let regali: Regalo[] = []
  let dbError = ''

  try {
    const data = await getData()
    rsvps = data.rsvps
    regali = data.regali
  } catch (err) {
    dbError = (err as Error).message
  }

  const confermati = rsvps.filter(r => r.partecipa)
  const nonVengono = rsvps.filter(r => !r.partecipa)
  const totPersone = confermati.reduce((s, r) => s + 1 + (r.rsvp_accompagnatori?.length ?? 0), 0)
  const totImporti = regali.reduce((s, r) => s + (r.importo ?? 0), 0)

  return (
    <>
      <Nav simple />
      <div className="bg-page-top h-24 -mb-24 pointer-events-none" />
      <main className="max-w-5xl mx-auto px-5 py-10">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-xl sm:text-3xl font-bold text-night">Dashboard Admin</h1>
        </div>

        {dbError && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-6 mb-8">
            <p className="text-red-700 font-medium font-[family-name:var(--font-inter)]">{dbError}</p>
            <p className="text-red-600 mt-2 text-sm font-[family-name:var(--font-inter)]">
              Vai su{' '}
              <a href="https://supabase.com/dashboard" className="underline" target="_blank" rel="noopener noreferrer">
                Supabase Dashboard
              </a>{' '}
              → SQL Editor ed esegui il file <code>supabase/schema.sql</code>.
            </p>
          </div>
        )}

        {/* Contatori RSVP */}
        <h2 className="text-lg sm:text-2xl font-bold text-night mb-4">Presenze</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Badge label="Confermati" value={confermati.length} color="bg-sunset/20 text-night" />
          <Badge label="Non vengono" value={nonVengono.length} color="bg-dust/20 text-night" />
          <Badge label="Risposte totali" value={rsvps.length} color="bg-lilac text-night" />
          <Badge label="Persone totali" value={totPersone} color="bg-pale text-night border-2 border-lilac" />
        </div>

        {/* Tabella RSVP */}
        {rsvps.length > 0 && (
          <div className="card overflow-x-auto mb-12">
            <table className="w-full text-left text-sm sm:text-base">
              <thead>
                <tr className="bg-night text-white">
                  <th className="p-3 sm:p-4 font-[family-name:var(--font-inter)]">Nome</th>
                  <th className="p-3 sm:p-4 font-[family-name:var(--font-inter)]">Cognome</th>
                  <th className="p-3 sm:p-4 font-[family-name:var(--font-inter)]">Partecipa</th>
                  <th className="p-3 sm:p-4 font-[family-name:var(--font-inter)]">Menu</th>
                  <th className="p-3 sm:p-4 font-[family-name:var(--font-inter)]">Allergie</th>
                  <th className="p-3 sm:p-4 font-[family-name:var(--font-inter)]">Accompagnatori</th>
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
                        <ul className="list-disc list-inside text-xs sm:text-sm font-[family-name:var(--font-inter)]">
                          {r.rsvp_accompagnatori.map(a => (
                            <li key={a.id}>
                              {a.nome} {a.cognome} · {a.menu}
                              {a.allergie ? ` · ${a.allergie}` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Regali */}
        <h2 className="text-lg sm:text-2xl font-bold text-night mb-4">
          Regali{' '}
          {totImporti > 0 && (
            <span className="text-sunset font-normal">— Totale dichiarato: €{totImporti}</span>
          )}
        </h2>

        {regali.length === 0 ? (
          <p className="text-dust text-lg font-[family-name:var(--font-inter)]">Nessuna richiesta regalo ancora.</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm sm:text-base">
              <thead>
                <tr className="bg-night text-white">
                  <th className="p-3 sm:p-4 font-[family-name:var(--font-inter)]">Nome</th>
                  <th className="p-3 sm:p-4 font-[family-name:var(--font-inter)]">Email</th>
                  <th className="p-3 sm:p-4 font-[family-name:var(--font-inter)]">Importo</th>
                  <th className="p-3 sm:p-4 font-[family-name:var(--font-inter)]">Messaggio</th>
                  <th className="p-3 sm:p-4 font-[family-name:var(--font-inter)]">Data</th>
                </tr>
              </thead>
              <tbody>
                {regali.map(r => (
                  <tr key={r.id} className="border-t border-lilac">
                    <td className="p-3 sm:p-4">{r.nome || '—'}</td>
                    <td className="p-3 sm:p-4">{r.email}</td>
                    <td className="p-3 sm:p-4">{r.importo ? `€${r.importo}` : '—'}</td>
                    <td className="p-3 sm:p-4 text-dust max-w-xs truncate font-[family-name:var(--font-inter)]">{r.messaggio || '—'}</td>
                    <td className="p-3 sm:p-4 text-dust font-[family-name:var(--font-inter)]">
                      {new Date(r.created_at).toLocaleDateString('it-IT')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
