import Nav from '@/components/Nav'

export default function MusicaPage() {
  return (
    <>
      <Nav />
      <div className="bg-page-top h-24 -mb-24 pointer-events-none" />

      <main className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-night mb-8 text-center">
          La nostra musica
        </h1>

        <div className="bg-info-gradient rounded-2xl p-7 text-center">
          <p className="text-night text-lg sm:text-xl mb-3">
            Premi il tasto 🔊 in basso a destra per avviare la musica.
          </p>
          <p className="text-dust text-base font-[family-name:var(--font-inter)]">
            Assicurati che il volume del dispositivo sia alzato.
          </p>
        </div>
      </main>
    </>
  )
}
