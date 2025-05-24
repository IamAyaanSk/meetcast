'use client'

import { Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MediaKind } from 'mediasoup-client/types'

interface VideoTileProps {
  isLocal: boolean
  name: string
  stream: MediaStream
  isAudioMuted?: boolean
  isVideoMuted?: boolean
  pauseMedia?: (kind: MediaKind) => void
  resumeMedia?: (kind: MediaKind) => void
  className?: string
}

export default function VideoTile({
  isLocal,
  name,
  stream,
  isAudioMuted = false,
  isVideoMuted = false,
  pauseMedia,
  resumeMedia,
  className
}: VideoTileProps) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden transition-all duration-300 bg-gray-700 flex items-center justify-center flex-col',
        className
      )}
    >
      <div className="relative aspect-video h-full w-full">
        <video
          ref={(el) => {
            if (el) el.srcObject = stream
          }}
          autoPlay
          playsInline
          muted={isLocal || isAudioMuted}
          className={cn('object-cover h-full w-full rounded-t-lg')}
        />

        {isVideoMuted && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-2xl font-semibold">{name.slice(0, 2).toUpperCase()}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-sm">{name}</div>

        <div className="absolute top-2 right-2 flex gap-1">
          {isAudioMuted && (
            <div className="bg-black/60 p-1 rounded-full">
              <MicOff className="h-4 w-4 text-red-400" />
            </div>
          )}
          {isVideoMuted && (
            <div className="bg-black/60 p-1 rounded-full">
              <VideoOff className="h-4 w-4 text-red-400" />
            </div>
          )}
        </div>

        {isLocal && pauseMedia && resumeMedia && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/30">
            <div className="flex gap-3">
              <Button
                variant={isAudioMuted ? 'destructive' : 'secondary'}
                size="icon"
                onClick={() => (isAudioMuted ? resumeMedia('audio') : pauseMedia('audio'))}
                aria-label={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
                className="shadow-lg transition-transform duration-200 hover:scale-110"
              >
                {isAudioMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>

              <Button
                variant={isVideoMuted ? 'destructive' : 'secondary'}
                size="icon"
                onClick={() => (isVideoMuted ? resumeMedia('video') : pauseMedia('video'))}
                aria-label={isVideoMuted ? 'Turn on camera' : 'Turn off camera'}
                className="shadow-lg transition-transform duration-200 hover:scale-110"
              >
                {isVideoMuted ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
