import type { Metadata, Viewport } from 'next'
import { Lora, Inter } from 'next/font/google'
import './globals.css'
import MusicPlayer from '@/components/MusicPlayer'

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Marco & Cristina',
  description: 'Il nostro matrimonio',
  icons: { icon: '/icon.png' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${lora.variable} ${inter.variable}`}>
      <body className="font-[family-name:var(--font-lora)]">
        {children}
        <MusicPlayer />
      </body>
    </html>
  )
}
