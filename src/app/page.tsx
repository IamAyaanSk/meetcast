'use client'

import { VideoIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { socket } from '@/socket'

export default function Home() {
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    socket.emit('getRecorderStatus')

    socket.on('recorderStatus', ({ isRecording }) => (isRecording ? setIsLive(true) : setIsLive(false)))

    return () => {
      socket.off('recorderStatus')
    }
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 h-[100svh] overflow-hidden flex flex-col justify-between">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold flex items-center gap-2 text-cyan-400 justify-center">
          <VideoIcon size={32} className="bg-cyan-400 text-blue-950 rounded-full p-1" /> Hello there! Welcome to
          MeetCast
        </h1>
        <Badge
          variant="outline"
          className="px-3 py-1.5 border-cyan-800 font-semibold text-cyan-400 bg-blue-950 border-0 text-xs"
        >
          Made by Ayaan
        </Badge>
      </header>

      <main>
        <Card className="bg-zinc-900 border-cyan-800 shadow-lg overflow-hidden px-2 py-16">
          <CardContent className="p-0 h-full w-full flex flex-col gap-4 items-center justify-center">
            <h3 className="text-xl text-white mb-4">🌟 Where to start?</h3>
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <h4 className="text-lg text-cyan-400">🎥 Start or join a call</h4>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  Hop into an ongoing call or start a new one if none exists! 🚀
                  <br />
                  You&apos;ll be taken to a Meet-like interface. Open other tabs to join as more participants. It&apos;s
                  easy and fun! 😄
                </p>
                <Badge
                  variant="outline"
                  className="px-3 py-1.5 border-cyan-800 font-semibold text-cyan-400 bg-blue-950 border-0 text-xs"
                >
                  <a href="/stream" target="_blank">
                    🚀 Start now!!
                  </a>
                </Badge>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-lg text-cyan-400">📺 Watch the live stream (with playback too 🔥)</h4>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  Watch as an audience! 🍿
                  <br />
                  Watch the live hls stream of the ongoing call — it starts automatically when the call begins and ends
                  when it&apos;s over. 📡
                </p>

                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="px-3 py-1.5 border-cyan-800 font-semibold text-cyan-400 bg-blue-950 border-0 text-xs"
                  >
                    <a href="/watch" target="_blank">
                      👀 Watch now!!
                    </a>
                  </Badge>

                  {isLive && (
                    <Badge className="bg-red-100 text-red-600 font-semibold px-3 py-1 rounded-full text-xs flex justify-center items-center gap-1.5">
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex size-2.5 rounded-full bg-red-600"></span>
                      </span>
                      Live stream available
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-6 mb-2 text-center text-gray-400 text-sm">
        <div className="inline-flex items-center gap-2 bg-blue-950 px-4 py-2 rounded-full">
          <span>Awesome</span>
          <span className="font-semibold text-cyan-400">MeetCast</span>
        </div>
      </footer>
    </div>
  )
}
