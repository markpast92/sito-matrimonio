import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import RsvpTable from '@/components/admin/RsvpTable'
import RegaliTable from '@/components/admin/RegaliTable'

export const dynamic = 'force-dynamic'

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Badge label="Confermati" value={confermati.length} color="bg-sunset text-white shadow-sm" />
          <Badge label="Non vengono" value={nonVengono.length} color="bg-dust/25 text-night" />
          <Badge label="Risposte totali" value={rsvps.length} color="bg-lilac/80 text-night" />
          <Badge label="Persone totali" value={totPersone} color="bg-night text-white shadow-sm" />
        </div>

        <RsvpTable rsvps={rsvps} />

        <RegaliTable regali={regali} totImporti={totImporti} />
      </main>
    </>
  )
}
