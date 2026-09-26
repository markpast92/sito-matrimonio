'use client'
import Nav from '@/components/Nav'
import RsvpSection from '@/components/RsvpSection'

export default function RSVPPage() {
  return (
    <>
      <Nav />
      <div className="bg-page-top h-24 -mb-24 pointer-events-none" />
      <main className="max-w-2xl mx-auto px-5 py-10">
        <RsvpSection />
      </main>
    </>
  )
}
