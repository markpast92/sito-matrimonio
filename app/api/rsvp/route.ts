import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type Ospite = {
  nome: string
  cognome: string
  menu: string
  menuAltro: string
  allergie: string
}

const menuStr = (o: Ospite) =>
  o.menu === 'altro' ? `altro: ${o.menuAltro || ''}`.trim() : o.menu

export async function POST(req: Request) {
  const { principale, accompagnatori, partecipa } = await req.json()

  if (!principale?.nome?.trim() || !principale?.cognome?.trim()) {
    return NextResponse.json({ error: 'Nome e cognome sono obbligatori' }, { status: 400 })
  }

  const db = supabaseAdmin()

  const { data: rsvp, error } = await db
    .from('rsvp')
    .upsert(
      {
        nome: principale.nome.trim(),
        cognome: principale.cognome.trim(),
        partecipa: partecipa !== false,
        menu: menuStr(principale),
        allergie: principale.allergie?.trim() || null,
      },
      { onConflict: 'nome,cognome' }
    )
    .select()
    .single()

  if (error) {
    console.error('rsvp error:', error)
    return NextResponse.json({ error: 'Errore nel salvataggio. Riprova.' }, { status: 500 })
  }

  await db.from('rsvp_accompagnatori').delete().eq('rsvp_id', rsvp.id)

  if (partecipa !== false && Array.isArray(accompagnatori) && accompagnatori.length > 0) {
    const rows = (accompagnatori as Ospite[])
      .filter(a => a.nome?.trim() && a.cognome?.trim())
      .map(a => ({
        rsvp_id: rsvp.id,
        nome: a.nome.trim(),
        cognome: a.cognome.trim(),
        menu: menuStr(a),
        allergie: a.allergie?.trim() || null,
      }))
    if (rows.length > 0) await db.from('rsvp_accompagnatori').insert(rows)
  }

  return NextResponse.json({ ok: true })
}
