import { CallInterface } from '@/components/stream/call-interface'
import { Badge } from '@/components/ui/badge'
import { VideoIcon } from 'lucide-react'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const isRecorder = searchParams.mode === 'recorder'

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 h-[100svh] overflow-hidden flex flex-col justify-between">
      {!isRecorder && (
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold flex items-center gap-2 text-cyan-400 justify-center">
            <VideoIcon size={32} className="bg-cyan-400 text-blue-950 rounded-full p-1" /> You are in the call!
          </h1>
          <Badge
            variant="outline"
            className="px-3 py-1.5 border-cyan-800 font-semibold text-cyan-400 bg-blue-950 border-0 text-xs"
          >
            Made by Ayaan
          </Badge>
        </header>
      )}

      <CallInterface isRecorder={isRecorder} />

      {!isRecorder && (
        <footer className="mt-6 mb-2 text-center text-gray-400 text-sm">
          <div className="inline-flex items-center gap-2 bg-blue-950 px-4 py-2 rounded-full">
            <span>Awesome</span>
            <span className="font-semibold text-cyan-400">MeetCast</span>
          </div>
        </footer>
      )}
    </div>
  )
}
