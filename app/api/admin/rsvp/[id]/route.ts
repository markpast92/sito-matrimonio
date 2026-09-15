import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

function menuStr(m: string) {
  return ['standard', 'vegetariano', 'vegano', 'altro'].includes(m?.toLowerCase()) ? m.toLowerCase() : 'standard'
}

async function checkAdmin() {
  const c = await cookies()
  return c.get('admin_auth')?.value === 'ok'
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const { id } = await params
  const db = supabaseAdmin()
  const { error } = await db.from('rsvp').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const { id } = await params
  const { nome, cognome, partecipa, menu, allergie, accompagnatori } = await req.json()

  if (!nome?.trim() || !cognome?.trim()) {
    return NextResponse.json({ error: 'Nome e cognome obbligatori' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { error: updateError } = await db.from('rsvp').update({
    nome: nome.trim(),
    cognome: cognome.trim(),
    partecipa: partecipa !== false,
    menu: menuStr(menu),
    allergie: allergie?.trim() || null,
  }).eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await db.from('rsvp_accompagnatori').delete().eq('rsvp_id', id)

  if (partecipa !== false && Array.isArray(accompagnatori) && accompagnatori.length > 0) {
    const rows = accompagnatori
      .filter((a: { nome?: string; cognome?: string }) => a.nome?.trim() && a.cognome?.trim())
      .map((a: { nome: string; cognome: string; menu?: string; allergie?: string }) => ({
        rsvp_id: id,
        nome: a.nome.trim(),
        cognome: a.cognome.trim(),
        menu: menuStr(a.menu ?? 'standard'),
        allergie: a.allergie?.trim() || null,
      }))
    if (rows.length > 0) {
      const { error: accErr } = await db.from('rsvp_accompagnatori').insert(rows)
      if (accErr) return NextResponse.json({ error: accErr.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
