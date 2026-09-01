import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC = ['/password', '/api/auth', '/api/admin-auth', '/api/admin-logout', '/api/logout']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Gate password sito per tutti
  const siteAuth = request.cookies.get('site_auth')?.value
  if (siteAuth !== 'ok') {
    return NextResponse.redirect(new URL('/password', request.url))
  }

  // Gate admin per /admin/* (escluso /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminAuth = request.cookies.get('admin_auth')?.value
    if (adminAuth !== 'ok') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
