'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'

export default function MusicaPage() {
  const [volumeConfermato, setVolumeConfermato] = useState(false)

  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-night mb-6 text-center">
          La nostra musica
        </h1>

        {!volumeConfermato && (
          <div className="bg-sunset text-white rounded-2xl p-6 mb-6 text-center">
            <p className="text-2xl font-bold mb-4">
              Alza il volume del dispositivo!
            </p>
            <p className="text-xl mb-6">
              Prima di avviare la musica, assicurati che il volume sia abbastanza alto.
            </p>
            <button
              onClick={() => setVolumeConfermato(true)}
              className="bg-white text-sunset rounded-xl px-8 py-4 text-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Volume alzato, procedi
            </button>
          </div>
        )}

        <div className="bg-lilac rounded-2xl p-8 text-center">
          <p className="text-night text-xl">
            Usa il tasto 🔊 in basso a destra per avviare la musica di sottofondo.
          </p>
          <p className="text-dust mt-3">
            Una canzone scelta a sorpresa dalla nostra playlist ti accompagnerà durante la navigazione.
          </p>
        </div>
      </main>
    </>
  )
}
