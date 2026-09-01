import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const validUser =
    [process.env.ADMIN_USER_1, process.env.ADMIN_USER_2].includes(username) &&
    password === process.env.ADMIN_PASSWORD

  if (!validUser) {
    return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_auth', 'ok', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 ore
    path: '/',
  })
  return res
}
