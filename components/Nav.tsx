'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/rsvp', label: 'Conferma presenza' },
  { href: '/regalo', label: 'Regalo' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="bg-nav-gradient text-white sticky top-0 z-40 shadow-md">
      {/* ── Barra principale ── */}
      <div className="flex items-center px-5 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-[family-name:var(--font-lora)] text-xl font-semibold tracking-wide text-white shrink-0"
        >
          M &amp; C
        </Link>

        {/* Link desktop — centrati */}
        <ul className="hidden md:flex gap-8 items-center flex-1 justify-center">
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`relative text-lg pb-1 transition-colors duration-200 ${
                  isActive(l.href)
                    ? 'text-sunset font-semibold'
                    : 'text-white/90 hover:text-sunset'
                }`}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sunset rounded-full" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout desktop */}
        <form action="/api/logout" method="POST" className="hidden md:block shrink-0">
          <button
            type="submit"
            className="text-white/60 hover:text-white text-sm transition-colors font-[family-name:var(--font-inter)] underline underline-offset-2"
          >
            Esci
          </button>
        </form>

        {/* Hamburger — mobile */}
        <div className="flex-1 flex justify-end md:hidden">
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Chiudi menu' : 'Apri menu'}
            className="flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Menu mobile dropdown ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col border-t border-white/10">
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`flex items-center px-6 py-4 text-lg transition-colors duration-200 ${
                  isActive(l.href)
                    ? 'bg-white/15 text-sunset font-semibold border-l-4 border-sunset'
                    : 'text-white/90 hover:bg-white/10 hover:text-sunset border-l-4 border-transparent'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          {/* Logout in fondo al dropdown */}
          <li className="border-t border-white/10 mt-1">
            <form action="/api/logout" method="POST">
              <button
                type="submit"
                className="flex items-center w-full px-6 py-4 text-base text-white/50 hover:text-white transition-colors font-[family-name:var(--font-inter)]"
              >
                Esci dal sito
              </button>
            </form>
          </li>
        </ul>
      </div>
    </nav>
  )
}
