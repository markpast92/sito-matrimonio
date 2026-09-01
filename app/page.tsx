import type { Metadata } from 'next'
import HomeClient from '@/components/HomeClient'

export const metadata: Metadata = {
  title: 'Marco & Cristina — 10 settembre 2027',
}

export default function Page() {
  return <HomeClient />
}
