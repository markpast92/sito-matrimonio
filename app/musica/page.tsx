'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'

export default function MusicaPage() {
  const [volumeConfermato, setVolumeConfermato] = useState(false)

  return (
    <>
      <Nav />
      <div className="bg-page-top h-24 -mb-24 pointer-events-none" />

      <main className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-night mb-8 text-center">
          La nostra musica
        </h1>

        {!volumeConfermato && (
          <div className="rounded-2xl p-7 mb-6 text-center animate-slide-up"
            style={{ background: 'linear-gradient(135deg, #E6A67D 0%, #d4895c 100%)' }}>
            <div className="text-5xl mb-4">🔊</div>
            <p className="text-white text-xl sm:text-2xl font-bold mb-3">
              Alza il volume del dispositivo!
            </p>
            <p className="text-white/90 text-base sm:text-lg mb-6 font-[family-name:var(--font-inter)]">
              Prima di avviare la musica, assicurati che il volume sia abbastanza alto.
            </p>
            <button onClick={() => setVolumeConfermato(true)}
              className="bg-white text-sunset rounded-xl px-8 py-4 text-lg font-semibold hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sunset font-[family-name:var(--font-inter)]">
              Volume alzato, procedi
            </button>
          </div>
        )}

        <div className="bg-info-gradient rounded-2xl p-7 text-center">
          <p className="text-night text-lg sm:text-xl mb-3">
            Usa il tasto in basso a destra per avviare la musica di sottofondo.
          </p>
          <p className="text-dust text-base font-[family-name:var(--font-inter)]">
            Una canzone scelta a sorpresa dalla nostra playlist ti accompagnerà durante la navigazione.
          </p>
        </div>
      </main>
    </>
  )
}
