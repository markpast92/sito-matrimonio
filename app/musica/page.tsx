'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'

const PLAYLIST_ID = process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID

export default function MusicaPage() {
  const [volumeConfermato, setVolumeConfermato] = useState(false)

  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-night mb-6 text-center">
          La nostra musica
        </h1>

        {/* Avviso volume — rimane finché l'utente non conferma */}
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

        {/* Player Spotify */}
        {PLAYLIST_ID ? (
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src={`https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`}
              width="100%"
              height="500"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Playlist matrimonio Marco e Cristina"
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <p className="text-dust text-xl">
              La playlist non è ancora configurata.
            </p>
            <p className="text-dust mt-2">
              Aggiungi <code className="bg-lilac px-2 py-1 rounded text-sm">NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID</code> nel file <code className="bg-lilac px-2 py-1 rounded text-sm">.env</code>.
            </p>
          </div>
        )}
      </main>
    </>
  )
}
