import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = supabaseAdmin()

  // INSERT + DELETE reale per garantire attività sul DB (il semplice SELECT
  // con anon key veniva bloccato da RLS e Supabase sospendeva il progetto)
  const { error: insertError } = await db.from('rsvp').insert({
    nome: '__keepalive__',
    cognome: '__ping__',
    partecipa: false,
    menu: 'standard',
  })

  if (insertError) {
    console.error('Keep-alive insert failed:', insertError.message)
    return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 })
  }

  const { error: deleteError } = await db
    .from('rsvp')
    .delete()
    .eq('nome', '__keepalive__')
    .eq('cognome', '__ping__')

  if (deleteError) {
    console.error('Keep-alive delete failed:', deleteError.message)
    return NextResponse.json({ ok: false, error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
