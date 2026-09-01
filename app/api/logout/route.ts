import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/password', req.url))
  res.cookies.delete('site_auth')
  res.cookies.delete('admin_auth')
  return res
}
