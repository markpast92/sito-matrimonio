'use client'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window { SC: any }
}

const PLAYLIST_URL = 'https://soundcloud.com/marco-pastorello-609505187/sets/sito-matrimonio'

export default function MusicPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<any>(null)
  const initRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [showVolumeWarning, setShowVolumeWarning] = useState(false)
  const [volumeOk, setVolumeOk] = useState(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const script = document.createElement('script')
    script.src = 'https://w.soundcloud.com/player/api.js'
    script.onload = () => {
      if (!iframeRef.current) return
      const widget = window.SC.Widget(iframeRef.current)
      widgetRef.current = widget
      widget.bind(window.SC.Widget.Events.READY, () => setReady(true))
      widget.bind(window.SC.Widget.Events.PLAY, () => setPlaying(true))
      widget.bind(window.SC.Widget.Events.PAUSE, () => setPlaying(false))
      widget.bind(window.SC.Widget.Events.FINISH, () => setPlaying(false))
    }
    document.body.appendChild(script)
  }, [])

  const toggle = () => {
    const widget = widgetRef.current
    if (!widget) return

    if (playing) {
      widget.pause()
      return
    }

    if (!volumeOk) {
      setShowVolumeWarning(true)
      return
    }

    widget.play()
  }

  function confirmVolume() {
    setVolumeOk(true)
    setShowVolumeWarning(false)
    widgetRef.current?.play()
  }

  return (
    <>
      {/* Off-screen — display:none e w-px rompono il SC Widget */}
      <iframe
        ref={iframeRef}
        style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '300px', height: '80px' }}
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(PLAYLIST_URL)}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&buying=false&sharing=false&download=false`}
        allow="autoplay"
      />

      {/* Volume warning popover */}
      {showVolumeWarning && (
        <div
          className="fixed z-50 animate-slide-up"
          style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))', right: '1.5rem' }}
        >
          <div className="bg-night text-white rounded-2xl shadow-2xl p-5 w-64">
            <p className="text-2xl mb-2 text-center">🔊</p>
            <p className="text-base font-semibold text-center mb-1">Alza il volume!</p>
            <p className="text-sm text-white/70 text-center mb-4 font-[family-name:var(--font-inter)]">
              Per favore alza il volume del dispositivo prima di avviare la musica.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowVolumeWarning(false)}
                className="flex-1 py-2 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 transition-colors font-[family-name:var(--font-inter)]"
              >
                Annulla
              </button>
              <button
                onClick={confirmVolume}
                className="flex-1 py-2 rounded-xl bg-sunset text-white text-sm font-semibold hover:opacity-90 transition-opacity font-[family-name:var(--font-inter)]"
              >
                Avvia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating play/pause button */}
      <button
        onClick={toggle}
        disabled={!ready}
        title={playing ? 'Pausa musica' : 'Riproduci musica'}
        aria-label={playing ? 'Pausa musica' : 'Riproduci musica'}
        className="fixed z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-wait hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset focus-visible:ring-offset-2"
        style={{
          bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
          right: '1.5rem',
          backgroundColor: playing ? '#E6A67D' : '#193250',
          color: 'white',
        }}
      >
        {playing ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z"/>
            <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.061Z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06Z"/>
          </svg>
        )}
      </button>
    </>
  )
}
