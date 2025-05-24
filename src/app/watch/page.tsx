'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import VideoPlayer from '@/components/watch/video-player'
import { Info, VideoIcon } from 'lucide-react'
import { WaitingState } from '@/components/watch/waiting-state'
import { RECORDER_URL } from '@/constants/global'
import { useEffect, useState } from 'react'
import { socket } from '@/socket'

export default function WatchPage() {
  const [streamUrl, setStreamUrl] = useState<string | null>(null)

  useEffect(() => {
    socket.emit('getRecorderStatus')

    socket.on('recorderStatus', ({ isRecording }) =>
      isRecording ? setStreamUrl(`${RECORDER_URL}/stream/stream.m3u8`) : setStreamUrl(null)
    )

    return () => {
      socket.off('recorderStatus')
    }
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 h-[100svh] overflow-hidden flex flex-col justify-between">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold flex items-center gap-2 text-cyan-400 justify-center">
          <VideoIcon size={32} className="bg-cyan-400 text-blue-950 rounded-full p-1" /> Call Stream Playback
        </h1>
        <Badge
          variant="outline"
          className="px-3 py-1.5 border-cyan-800 font-semibold text-cyan-400 bg-blue-950 border-0 text-xs"
        >
          Made by Ayaan
        </Badge>
      </header>

      <main>
        <Card className="bg-zinc-900 aspect-video border-cyan-800 shadow-lg overflow-hidden p-2">
          <CardContent className="p-0 h-full w-full">
            {streamUrl ? <VideoPlayer streamUrl={streamUrl} /> : <WaitingState />}
          </CardContent>
        </Card>

        {streamUrl && (
          <Badge className="absolute bottom-8 right-10 text-yellow-600 font-semibold px-3 py-1 rounded-full text-xs">
            <Info /> Please refresh the page if stream not started automatically
          </Badge>
        )}
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
