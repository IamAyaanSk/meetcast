'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

type TVideoPlayerProps = {
  streamUrl: string
}

export default function VideoPlayer({ streamUrl }: TVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 3,
        maxBufferLength: 15,
        enableWorker: true
      })

      hls.loadSource(streamUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((error) => {
          console.log('Autoplay prevented:', error)
        })
      })

      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = streamUrl
      video.addEventListener('loadedmetadata', () => {
        video.play().catch((error) => {
          console.log('Autoplay prevented:', error)
        })
      })
    }
  }, [streamUrl])

  return <video ref={videoRef} className="w-full rounded-2xl h-full object-cover" playsInline controls />
}
