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

// Logo dentro un cerchio - dimensione e zoom regolabili via CSS (--fico-circle-*)
function FicoCircle() {
  return (
    <div className="fico-circle shadow-md">
      <Image
        src="/fico-dindia-icon.jpg"
        alt="Marco & Cristina"
        width={200}
        height={200}
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

  // Blocca lo scroll di sfondo mentre il menu è aperto
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Nome dell'ospite loggato (letto quando si apre il menu, così è sempre aggiornato)
  const [guestName, setGuestName] = useState('')
  useEffect(() => {
    if (open) setGuestName(localStorage.getItem('guest_name') || '')
  }, [open])

  // Click su una voce di menu: chiudi e, se è un'ancora della home, scorri con dolcezza
  function handleLinkClick(e: React.MouseEvent, href: string) {
    setOpen(false)
    if (href.includes('#') && pathname === '/') {
      e.preventDefault()
      const id = href.split('#')[1]
      const el = id ? document.getElementById(id) : null
      if (el) {
        // Aspetta la chiusura del drawer per evitare che il calcolo dello scroll sballi
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
      }
    }
  }

  if (simple) {
    return (
      <nav className="bg-nav-gradient text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between px-5 h-16">
          <FicoCircle />
          <LogoutIcon />
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="bg-nav-gradient text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between px-5 h-16">
          {/* Hamburger - sinistra */}
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

          {/* Logout - destra */}
          <LogoutIcon />
        </div>
      </nav>

      {/* ── Drawer laterale (mobile + desktop): overlay che non sposta il contenuto ── */}
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-night/50 backdrop-blur-[1px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      {/* Pannello */}
      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-nav-gradient text-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative flex items-center gap-3 px-6 py-6 pr-14 border-b border-white/10 shrink-0">
          <FicoCircle />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 font-[family-name:var(--font-inter)]">Ciao</p>
            <p className="text-lg font-semibold text-white truncate font-[family-name:var(--font-lora)]">
              {guestName || 'Marco & Cristina'}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Chiudi menu"
            tabIndex={open ? 0 : -1}
            className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <ul className="flex flex-col py-2 overflow-y-auto">
          {NAV_SECTIONS.map(s => (
            <li key={s.href}>
              <Link
                href={s.href}
                onClick={e => handleLinkClick(e, s.href)}
                tabIndex={open ? 0 : -1}
                className="flex items-center px-7 py-4 text-xl text-white/90 hover:bg-white/10 hover:text-sunset active:bg-white/15 transition-colors duration-200 border-l-4 border-transparent hover:border-sunset focus-visible:outline-none focus-visible:bg-white/10 focus-visible:text-sunset font-[family-name:var(--font-inter)]"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  )
}
