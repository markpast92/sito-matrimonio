import Nav from '@/components/Nav'

export default function AdminPage() {
  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold text-night mb-4">Dashboard Admin</h1>
        <p className="text-dust text-xl">
          Area riservata a Marco e Cristina — disponibile nella Fase 8.
        </p>
      </main>
    </>
  )
}
