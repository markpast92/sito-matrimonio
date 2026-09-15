import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const c = await cookies()
  if (c.get('admin_auth')?.value !== 'ok') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const { table } = await req.json()
  if (table !== 'rsvp' && table !== 'regali') {
    return NextResponse.json({ error: 'Tabella non valida' }, { status: 400 })
  }

  const db = supabaseAdmin()
  // neq('id', '00000000-0000-0000-0000-000000000000') è un trucco per cancellare tutte le righe
  // senza una WHERE letterale (Supabase JS non supporta DELETE senza filtro per sicurezza)
  const { error } = await db.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
