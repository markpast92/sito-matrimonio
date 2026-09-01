import { NextResponse } from 'next/server'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 giorni
  path: '/',
}

export async function POST(req: Request) {
  const { password } = await req.json()

  // Admin password → accesso completo + dashboard
  if (password && password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true, admin: true })
    res.cookies.set('site_auth', 'ok', COOKIE_OPTS)
    res.cookies.set('admin_auth', 'ok', COOKIE_OPTS)
    return res
  }

  // Password ospiti → accesso normale al sito
  if (password && password === process.env.SITE_PASSWORD) {
    const res = NextResponse.json({ ok: true, admin: false })
    res.cookies.set('site_auth', 'ok', COOKIE_OPTS)
    return res
  }

  return NextResponse.json({ error: 'Password errata' }, { status: 401 })
}
