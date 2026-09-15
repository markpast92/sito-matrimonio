import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

async function checkAdmin() {
  const c = await cookies()
  return c.get('admin_auth')?.value === 'ok'
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const { id } = await params
  const db = supabaseAdmin()
  const { error } = await db.from('regali').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const { id } = await params
  const { nome, email, importo, messaggio } = await req.json()

  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email obbligatoria' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { error } = await db.from('regali').update({
    nome: nome?.trim() || null,
    email: email.trim(),
    importo: importo ? Number(importo) : null,
    messaggio: messaggio?.trim() || null,
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
