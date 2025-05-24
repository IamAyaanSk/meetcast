'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { socket } from '@/socket'
import { Device } from 'mediasoup-client'
import { Consumer, MediaKind, Producer, RtpCapabilities, Transport } from 'mediasoup-client/types'
import VideoTile from '@/components/stream/video-tile'
import { MEDIASOUP_VIDEO_PRODUCER_OPTIONS } from '@/constants/global'
import { getGridClass } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type TCallInterfaceProps = {
  isRecorder?: boolean
}

export function CallInterface({ isRecorder }: TCallInterfaceProps) {
  const device = useRef<Device | null>(null)
  const producerTransport = useRef<Transport | null>(null)
  const consumerTransport = useRef<Transport | null>(null)

  const audioProducer = useRef<Producer | null>(null)
  const videoProducer = useRef<Producer | null>(null)

  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isLive, setIsLive] = useState(false)

  const consumers = useRef(new Map<string, Consumer[]>())

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({})

  // HELPERRS

  const startProduceMedia = useCallback(async () => {
    if (!producerTransport.current) {
      console.error('Producer transport not ready')
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' },
      audio: {
        autoGainControl: true,
        noiseSuppression: true,
        echoCancellation: true,
        sampleRate: 48000,
        sampleSize: 16
      }
    })

    const videoTrack = stream.getVideoTracks()[0]
    const audioTrack = stream.getAudioTracks()[0]

    try {
      videoProducer.current = await producerTransport.current.produce({
        track: videoTrack,
        ...MEDIASOUP_VIDEO_PRODUCER_OPTIONS
      })

      audioProducer.current = await producerTransport.current.produce({ track: audioTrack })

      videoProducer.current.on('trackended', () => console.log('video track ended'))
      videoProducer.current.on('transportclose', () => console.log('video transport closed'))

      audioProducer.current.on('trackended', () => console.log('audio track ended'))
      audioProducer.current.on('transportclose', () => console.log('audio transport closed'))

      setLocalStream(stream)

      console.log('Producers created:', {
        video: videoProducer.current.id,
        audio: audioProducer.current.id
      })
    } catch (err) {
      console.error('Produce media error:', err)
    }
  }, [])

  const createConsumer = useCallback(
    async ({ producerSocketId, rtpCapabilities }: { producerSocketId: string; rtpCapabilities: RtpCapabilities }) => {
      return new Promise((resolve, reject) => {
        socket.emit('consumeMedia', { producerSocketId, rtpCapabilities }, async (props) => {
          if (!consumerTransport.current) {
            console.error('Consumer transport not ready')
            return
          }

          try {
            for (const { id, kind, producerId, rtpParameters, paused } of props) {
              const consumer = await consumerTransport.current.consume({
                id,
                producerId,
                kind,
                rtpParameters
              })

              // Pause the consumer if needed
              if (paused) {
                consumer.pause()
                console.log(`Consumer ${kind} paused by default`)
              }

              setRemoteStreams((prev) => {
                // Check if stream for this producer already exists
                const existingStream = prev[producerSocketId]

                const newStream = existingStream
                  ? new MediaStream([...existingStream.getTracks(), consumer.track])
                  : new MediaStream([consumer.track])

                return {
                  ...prev,
                  [producerSocketId]: newStream
                }
              })

              consumer.on('trackended', () => {
                console.log(`Consumer ${kind} track ended`)
                setRemoteStreams((prev) => {
                  const updated = { ...prev }
                  const stream = updated[producerSocketId]
                  if (stream) {
                    const remainingTracks = stream.getTracks().filter((t) => t.id !== consumer.track.id)
                    if (remainingTracks.length > 0) {
                      updated[producerSocketId] = new MediaStream(remainingTracks)
                    } else {
                      delete updated[producerSocketId]
                    }
                  }
                  return updated
                })
              })

              consumer.on('transportclose', () => {
                console.log(`Consumer ${kind} transport closed`)
                setRemoteStreams((prev) => {
                  const updated = { ...prev }
                  delete updated[producerSocketId]
                  return updated
                })
              })

              // This stores consumer in consumers ref
              const existingConsumers = consumers.current.get(producerSocketId) || []
              consumers.current.set(producerSocketId, [...existingConsumers, consumer])

              console.log(
                'Consumer created:',
                {
                  id: consumer.id,
                  kind: consumer.kind,
                  producerId: consumer.producerId
                },
                'for producer',
                producerSocketId
              )

              socket.emit('resumeConsumer', { consumerId: consumer.id })
              console.log(`Consumer (${kind}) created for producer ${producerSocketId}`)
            }
            resolve(props)
          } catch (err) {
            console.error('Consumer error:', err)
            reject(err)
          }
        })
      })
    },
    []
  )

  const createSendTransport = useCallback(() => {
    socket.emit('createWebRtcTransport', { isSender: true }, async (params) => {
      const transport = device.current?.createSendTransport(params)
      if (!transport) {
        console.error('Transport creation error')
        return
      }

      transport.on('connect', ({ dtlsParameters }, callback) => {
        socket.emit('connectWebRtcTransport', { dtlsParameters, isSender: true })
        callback()
      })

      transport.on('produce', ({ kind, rtpParameters }, callback) => {
        socket.emit('produceMedia', { kind, rtpParameters }, callback)
      })

      producerTransport.current = transport
      console.log('Send transport created')

      await startProduceMedia()
      console.log('Media production started')
    })
  }, [startProduceMedia])

  const createRecvTransport = useCallback(() => {
    socket.emit('createWebRtcTransport', { isSender: false }, (params) => {
      const transport = device.current?.createRecvTransport(params)
      if (!transport) return

      transport.on('connect', ({ dtlsParameters }, callback) => {
        socket.emit('connectWebRtcTransport', { dtlsParameters, isSender: false })
        callback()
      })

      consumerTransport.current = transport

      socket.emit('getProducers')
    })
  }, [])

  useEffect(() => {
    if (!device.current) {
      device.current = new Device()
    }

    socket.on('connect', () => {
      console.log('Connected to server')
    })

    // Load RTP Capabilities
    socket.emit('getRouterRtpCapabilities', async ({ routerRtpCapabilities }) => {
      try {
        await device.current?.load({ routerRtpCapabilities })
        console.log('Device loaded')

        // Create transports
        if (!isRecorder) {
          createSendTransport()
          console.log('Send transport created')
        }

        createRecvTransport()

        console.log('Transports created')
      } catch (err) {
        console.error('Device load error:', err)
      }
    })

    // Check for live status
    socket.emit('getRecorderStatus')
    socket.on('recorderStatus', ({ isRecording }) => (isRecording ? setIsLive(true) : setIsLive(false)))

    // Handle producer socket IDs
    socket.on('producers', async (producers) => {
      const rtpCapabilities = device.current?.rtpCapabilities
      if (!rtpCapabilities) return

      for (const { producerSocketId } of producers) {
        await createConsumer({ producerSocketId, rtpCapabilities })
      }
    })

    // Handle participant connection
    socket.on('participantConnected', async (producerSocketId) => {
      console.log('Participant connected:', producerSocketId)
      const rtpCapabilities = device.current?.rtpCapabilities
      if (!rtpCapabilities) return

      if (producerSocketId === socket.id) {
        console.log('This is the local participant')
        return
      }

      await createConsumer({ producerSocketId: producerSocketId, rtpCapabilities })
    })

    // Remove consumer when participant disconnects
    socket.on('participantDisconnected', (producerSocketId) => {
      console.log('Participant disconnected:', producerSocketId)

      // Close the consumer
      const remoteConsumers = consumers.current.get(producerSocketId)
      if (!remoteConsumers) {
        console.error(`Consumer not found for producer ${producerSocketId}`)
        return
      }

      remoteConsumers?.forEach((consumer) => {
        consumer.close()
        console.log(`Consumer closed for producer ${producerSocketId}`)
      })

      setRemoteStreams((prev) => {
        const updated = { ...prev }
        delete updated[producerSocketId]
        return updated
      })
    })

    // Pause consumer on remote producer pause
    socket.on('producerPaused', ({ producerSocketId, kind }) => {
      const remoteConsumers = consumers.current.get(producerSocketId)
      if (!remoteConsumers) {
        console.error(`Consumer not found for producer ${producerSocketId}`)
        return
      }

      for (const consumer of remoteConsumers) {
        if (consumer.kind === kind) {
          consumer.pause()
          console.log(`Consumer paused for producer ${producerSocketId}`)
        }
      }

      // Update remote stream using the consumer ref
      const tracks = remoteConsumers.map((consumer) => consumer.track)
      setRemoteStreams((prev) => {
        const updated = { ...prev }
        const stream = updated[producerSocketId]
        if (stream) {
          const newStream = new MediaStream([...stream.getTracks(), ...tracks])
          updated[producerSocketId] = newStream
        }
        return updated
      })
    })

    // Resume consumer on remote producer resume
    socket.on('producerResumed', ({ producerSocketId, kind }) => {
      const remoteConsumers = consumers.current.get(producerSocketId)
      if (!remoteConsumers) {
        console.error(`Consumer not found for producer ${producerSocketId}`)
        return
      }

      for (const consumer of remoteConsumers) {
        if (consumer.kind === kind) {
          consumer.resume()
          console.log(`Consumer resumed for producer ${producerSocketId}`)
        }
      }

      // Update remote stream using the consumer ref
      const tracks = remoteConsumers.map((consumer) => consumer.track)
      setRemoteStreams((prev) => {
        const updated = { ...prev }
        const stream = updated[producerSocketId]
        if (stream) {
          const newStream = new MediaStream([...stream.getTracks(), ...tracks])
          updated[producerSocketId] = newStream
        }
        return updated
      })
    })

    const cleanup = () => {
      localStream?.getTracks().forEach((t) => t.stop())
      producerTransport.current?.close()
      consumerTransport.current?.close()
      videoProducer.current?.close()
      audioProducer.current?.close()

      consumers.current.forEach((consumerList) => {
        consumerList.forEach((consumer) => consumer.close())
      })
      consumers.current.clear()

      setLocalStream(null)

      socket.off('connect')
      socket.off('producers')
      socket.off('participantConnected')
      socket.off('participantDisconnected')
      socket.off('producerPaused')
      socket.off('producerResumed')
      socket.off('recorderStatus')
      socket.disconnect()
    }

    socket.on('disconnect', cleanup)

    return cleanup
  }, [createSendTransport, createRecvTransport, startProduceMedia, createConsumer, isRecorder])

  function pauseMedia(kind: MediaKind) {
    const producer = kind === 'video' ? videoProducer.current : audioProducer.current
    if (!producer) {
      console.error(`Producer ${kind} not found`)
      return
    }

    if (producer.paused) {
      console.log(`Producer ${kind} is already paused`)
      return
    }

    producer.pause()
    // Emit event to pause the producer on server
    socket.emit('pauseProducer', { producerId: producer.id }, () => {
      // This callback will pause the producer track
      const track = kind === 'video' ? localStream?.getVideoTracks()[0] : localStream?.getAudioTracks()[0]
      if (track && track.enabled) {
        track.enabled = false
        console.log(`Producer ${kind} track disabled`)
      }
    })

    const mediaState = kind === 'video' ? setIsCameraOff : setIsMuted
    mediaState(true)
  }

  function resumeMedia(kind: MediaKind) {
    const producer = kind === 'video' ? videoProducer.current : audioProducer.current
    if (!producer) {
      console.error(`Producer ${kind} not found`)
      return
    }

    if (!producer.paused) {
      console.log(`Producer ${kind} is already resumed`)
      return
    }

    producer.resume()
    // Emit event to resume the producer on server
    socket.emit('resumeProducer', { producerId: producer.id }, () => {
      // This callback will resume the producer track
      const track = kind === 'video' ? localStream?.getVideoTracks()[0] : localStream?.getAudioTracks()[0]
      if (track && !track.enabled) {
        track.enabled = true
        console.log(`Producer ${kind} track enabled`)
      }
    })

    const mediaState = kind === 'video' ? setIsCameraOff : setIsMuted
    mediaState(false)
  }

  const remoteStreamKeys = Object.keys(remoteStreams)

  return (
    <main className="h-[100svh] w-full bg-slate-950 flex items-center justify-center">
      {isLive && !isRecorder && (
        <Badge className="absolute bottom-11 right-10 bg-red-100 text-red-600 font-semibold px-3 py-1 rounded-full text-xs flex justify-center items-center gap-1.5">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex size-2.5 rounded-full bg-red-600"></span>
          </span>
          Live stream started
        </Badge>
      )}

      {localStream && !isRecorder && (
        <div
          className={`max-w-screen-lg m-auto p-4 h-[80svh] md:p-6 grid ${getGridClass(
            remoteStreamKeys.length
          )} gap-6 overflow-hidden bg-zinc-950 rounded-lg border border-cyan-800 relative`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-950 px-4 py-2 rounded-full absolute bottom-4 right-4  z-50 opacity-80 text-sm">
            <span>Powered by</span>
            <span className="font-semibold text-cyan-400">MeetCast</span>
          </div>
          <VideoTile
            isLocal={true}
            name="You"
            stream={localStream}
            isAudioMuted={isMuted}
            isVideoMuted={isCameraOff}
            pauseMedia={pauseMedia}
            resumeMedia={resumeMedia}
            className="border-2 border-blue-500"
          />

          {remoteStreamKeys.map((remoteId) => (
            <VideoTile
              key={remoteId}
              isLocal={false}
              name={remoteId}
              stream={remoteStreams[remoteId]}
              isAudioMuted={!remoteStreams[remoteId].getAudioTracks()[0]?.enabled}
              isVideoMuted={!remoteStreams[remoteId].getVideoTracks()[0]?.enabled}
              className="animate-fadeIn bg-zinc-800 border border-zinc-700 hover:border-zinc-600"
            />
          ))}
        </div>
      )}

      {isRecorder && remoteStreamKeys.length > 0 && (
        <div
          className={`max-w-screen-lg m-auto p-4 h-[80svh] md:p-6 grid ${getGridClass(
            remoteStreamKeys.length - 1
          )} gap-6 overflow-hidden bg-zinc-950 rounded-lg border border-cyan-800 relative`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-950 px-4 py-2 rounded-full absolute bottom-4 right-4  z-50 opacity-80 text-sm">
            <span>Powered by</span>
            <span className="font-semibold text-cyan-400">MeetCast</span>
          </div>
          {remoteStreamKeys.map((remoteId) => (
            <VideoTile
              key={remoteId}
              isLocal={false}
              name={remoteId}
              stream={remoteStreams[remoteId]}
              isAudioMuted={!remoteStreams[remoteId].getAudioTracks()[0]?.enabled}
              isVideoMuted={!remoteStreams[remoteId].getVideoTracks()[0]?.enabled}
              className="animate-fadeIn bg-gray-800 border border-gray-700 hover:border-gray-600"
            />
          ))}
        </div>
      )}
    </main>
  )
}
