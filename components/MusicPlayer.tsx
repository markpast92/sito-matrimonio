'use client'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window { SC: any }
}

const PLAYLIST_URL = 'https://soundcloud.com/marco-pastorello-609505187/sets/sito-matrimonio'

export default function MusicPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<any>(null)
  const startedRef = useRef(false)
  const initRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // ponytail: guard against React Strict Mode double-invoke
    if (initRef.current) return
    initRef.current = true

    const script = document.createElement('script')
    script.src = 'https://w.soundcloud.com/player/api.js'
    script.onload = () => {
      if (!iframeRef.current) return
      const widget = window.SC.Widget(iframeRef.current)
      widget.bind(window.SC.Widget.Events.READY, () => {
        widgetRef.current = widget
        setReady(true)
      })
      widget.bind(window.SC.Widget.Events.FINISH, () => setPlaying(false))
    }
    document.body.appendChild(script)
  }, [])

  const toggle = () => {
    const widget = widgetRef.current
    if (!widget) return
    if (playing) {
      widget.pause()
      setPlaying(false)
    } else {
      if (!startedRef.current) {
        startedRef.current = true
        // ponytail: getSounds at click time, READY-time call is unreliable with playlists
        widget.getSounds((sounds: any[]) => {
          if (sounds.length > 1) widget.skip(Math.floor(Math.random() * sounds.length))
          widget.play()
          setPlaying(true)
        })
        return
      }
      widget.play()
      setPlaying(true)
    }
  }

  return (
    <>
      {/* ponytail: off-screen with real dimensions, display:none and w-px break SC Widget init */}
      <iframe
        ref={iframeRef}
        style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '300px', height: '80px' }}
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(PLAYLIST_URL)}&auto_play=false&hide_related=true&show_comments=false`}
        allow="autoplay"
      />
      <button
        onClick={toggle}
        disabled={!ready}
        title={playing ? 'Pausa musica' : 'Riproduci musica'}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-wait"
        style={{ backgroundColor: playing ? '#E6A67D' : '#193250', color: 'white' }}
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
