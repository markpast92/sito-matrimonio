'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV_SECTIONS = [
  { href: '/#home',      label: 'Home' },
  { href: '/#quando',    label: 'Quando' },
  { href: '/#dove',      label: 'Dove' },
  { href: '/#programma', label: 'Cosa vi aspetta' },
  { href: '/#faq',       label: 'Domande frequenti' },
  { href: '/rsvp',       label: 'Partecipo' },
  { href: '/regalo',     label: 'Voglio fare un regalo' },
]

// Logo orizzontale trasparente (usato nella barra admin semplice)
function FicoImage({ priority, heightClass = 'h-9' }: { priority?: boolean; heightClass?: string }) {
  return (
    <Image
      src="/fico-dindia.png"
      alt="Marco & Cristina"
      width={1000}
      height={707}
      className={`${heightClass} w-auto block shrink-0`}
      priority={priority}
    />
  )
}

// Logo dentro un cerchio, usato nel menu — usa l'icona dedicata
function FicoCircle({ size = 72 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full overflow-hidden bg-white shadow-md shrink-0"
    >
      <Image
        src="/fico-dindia-icon.jpg"
        alt="Marco & Cristina"
        width={size}
        height={size}
        className="w-full h-full object-cover"
      />
    </div>
  )
}

// Icona logout classica (porta con freccia)
function LogoutIcon() {
  return (
    <form action="/api/logout" method="POST">
      <button
        type="submit"
        aria-label="Esci dal sito"
        title="Esci"
        className="w-12 h-12 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </form>
  )
}

function MenuLinks({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  return (
    <ul className="flex flex-col">
      {NAV_SECTIONS.map(s => (
        <li key={s.href}>
          <Link
            href={s.href}
            onClick={onNavigate}
            tabIndex={open ? 0 : -1}
            className="flex items-center px-6 py-4 text-lg text-white/90 hover:bg-white/10 hover:text-sunset transition-colors duration-200 border-l-4 border-transparent hover:border-sunset focus-visible:outline-none focus-visible:bg-white/10 focus-visible:text-sunset"
          >
            {s.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Nav({ simple }: { simple?: boolean }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  // Chiudi con Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (simple) {
    return (
      <nav className="bg-nav-gradient text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between px-5 py-3">
          <Link href="/" aria-label="Home">
            <FicoImage priority />
          </Link>
          <LogoutIcon />
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="bg-nav-gradient text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between px-5 py-3">
          {/* Hamburger — sinistra */}
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={open}
            className="flex flex-col justify-center items-center w-12 h-12 gap-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

          {/* Logout — destra */}
          <LogoutIcon />
        </div>

        {/* ── MOBILE: tendina dall'alto ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            open ? 'max-h-[36rem] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
          aria-hidden={!open}
        >
          <div className="border-t border-white/10">
            <div className="flex justify-center py-5">
              <FicoCircle />
            </div>
            <MenuLinks open={open} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      </nav>

      {/* ── DESKTOP: sidebar da sinistra ── */}
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`hidden md:block fixed inset-0 z-40 bg-night/40 backdrop-blur-[1px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      {/* Pannello */}
      <aside
        aria-hidden={!open}
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-50 w-72 bg-nav-gradient text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative flex justify-center px-6 py-6 border-b border-white/10">
          <FicoCircle />
          <button
            onClick={() => setOpen(false)}
            aria-label="Chiudi menu"
            tabIndex={open ? 0 : -1}
            className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="py-2">
          <MenuLinks open={open} onNavigate={() => setOpen(false)} />
        </div>
      </aside>
    </>
  )
}
