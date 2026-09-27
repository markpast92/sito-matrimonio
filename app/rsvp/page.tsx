'use client'
import Nav from '@/components/Nav'
import RsvpSection from '@/components/RsvpSection'

export default function RSVPPage() {
  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-5 py-10">
        <RsvpSection />
      </main>
    </>
  )
}
