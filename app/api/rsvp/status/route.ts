import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const nome = searchParams.get('nome')?.trim()
  const cognome = searchParams.get('cognome')?.trim()

  if (!nome || !cognome) return NextResponse.json({ status: 'none' })

  const db = supabaseAdmin()

  // Cerca nella tabella principale (case-insensitive)
  const { data: rsvp } = await db
    .from('rsvp')
    .select('*, rsvp_accompagnatori(*)')
    .ilike('nome', nome)
    .ilike('cognome', cognome)
    .maybeSingle()

  if (rsvp) return NextResponse.json({ status: 'principale', rsvp })

  // Cerca come accompagnatore con join al record principale
  const { data: acc } = await db
    .from('rsvp_accompagnatori')
    .select('*, rsvp(nome, cognome)')
    .ilike('nome', nome)
    .ilike('cognome', cognome)
    .maybeSingle()

  if (acc) {
    return NextResponse.json({
      status: 'accompagnatore',
      mainGuest: { nome: (acc.rsvp as { nome: string; cognome: string }).nome, cognome: (acc.rsvp as { nome: string; cognome: string }).cognome },
    })
  }

  return NextResponse.json({ status: 'none' })
}
