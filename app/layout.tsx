import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import './globals.css'
import MusicPlayer from '@/components/MusicPlayer'

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Marco & Cristina',
  description: 'Il nostro matrimonio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={lora.variable}>
      <body className="font-[family-name:var(--font-lora)]">
        {children}
        <MusicPlayer />
      </body>
    </html>
  )
}
