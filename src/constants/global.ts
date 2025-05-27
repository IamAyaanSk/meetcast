import { ProducerOptions } from 'mediasoup-client/types'

export const MEDIASOUP_VIDEO_PRODUCER_OPTIONS: ProducerOptions = {
  encodings: [
    { rid: 'r0', maxBitrate: 100_000, scalabilityMode: 'L1T3' },
    { rid: 'r1', maxBitrate: 300_000, scalabilityMode: 'L1T3' },
    { rid: 'r2', maxBitrate: 900_000, scalabilityMode: 'L1T3' }
  ],
  codecOptions: { videoGoogleStartBitrate: 1000 }
}

export const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ?? 'http://localhost:4000'

// In prod this would be received by server
export const RECORDER_URL = process.env.NEXT_PUBLIC_RECORDER_URL ?? 'http://localhost:8080'
