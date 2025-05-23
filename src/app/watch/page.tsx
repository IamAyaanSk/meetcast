import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import VideoPlayer from '@/components/watch/video-player'
import { VideoIcon } from 'lucide-react'
import { WaitingState } from '@/components/watch/waiting-state'

export default function WatchPage() {
  // TODO: This will be played when we get a socket response about the live hls playback availability
  // The url would also come from the socket response
  const streamUrl = 'http://localhost:8080/stream/stream.m3u8'
  // const streamUrl = null

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
