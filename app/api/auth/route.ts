import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json()
  if (password !== process.env.SITE_PASSWORD) {
    return NextResponse.json({ error: 'Password errata' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('site_auth', 'ok', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 giorni
    path: '/',
  })
  return res
}
