import Link from 'next/link'

const links = [
  { href: '/', label: 'Home' },
  { href: '/rsvp', label: 'Conferma presenza' },
  { href: '/regalo', label: 'Regalo' },
  { href: '/musica', label: 'Musica' },
]

export default function Nav() {
  return (
    <nav className="bg-night text-white py-4 px-6">
      <ul className="flex gap-6 justify-center flex-wrap">
        {links.map(l => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-lg hover:text-sunset transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
