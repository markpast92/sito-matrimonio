import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const { nome, email, importo, messaggio } = await req.json()

  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email obbligatoria' }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const nomeSaluto = nome?.trim() || 'amico/a'

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: email.trim(),
    subject: 'Coordinate bancarie per regalo di nozze Marco&Cristina',
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#193250">
        <h2 style="color:#E6A67D;margin-bottom:8px">Grazie di cuore, ${nomeSaluto}!</h2>
        <p>Siamo felicissimi che tu voglia farci un regalo.<br>
        Ecco i dati per effettuare il bonifico dalla tua banca:</p>
        <div style="background:#F6FEAA;padding:20px;border-radius:8px;margin:24px 0;line-height:2.2">
          <p style="margin:0"><strong>IBAN:</strong> ${process.env.WEDDING_IBAN}</p>
          <p style="margin:0"><strong>Intestatario:</strong> ${process.env.WEDDING_INTESTATARIO}</p>
          <p style="margin:0"><strong>Causale:</strong> ${process.env.WEDDING_CAUSALE_PREFIX} &mdash; ${nomeSaluto}</p>
        </div>
        ${importo ? `<p>Hai indicato che intendi versare <strong>&euro;${importo}</strong>. Naturalmente, potrai effettuare il bonifico per la cifra che preferisci.</p>` : ''}
        ${messaggio ? `<blockquote style="border-left:3px solid #E6A67D;padding-left:16px;color:#767293;font-style:italic">&ldquo;${messaggio}&rdquo;</blockquote>` : ''}
        <p style="margin-top:24px">A presto,<br><strong>Marco &amp; Cristina</strong></p>
      </div>
    `,
  })

  if (error) {
    console.error('resend error:', error)
    return NextResponse.json({ error: "Errore nell'invio email. Riprova." }, { status: 500 })
  }

  const db = supabaseAdmin()
  await db.from('regali').insert({
    nome: nome?.trim() || null,
    email: email.trim(),
    importo: importo ? Number(importo) : null,
    messaggio: messaggio?.trim() || null,
  })

  return NextResponse.json({ ok: true })
}
