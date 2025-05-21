import { ProducerOptions } from 'mediasoup-client/types'

export const MEDIASOUP_VIDEO_PRODUCER_OPTIONS: ProducerOptions = {
  encodings: [
    { rid: 'r0', maxBitrate: 100_000, scalabilityMode: 'S1T3' },
    { rid: 'r1', maxBitrate: 300_000, scalabilityMode: 'S1T3' },
    { rid: 'r2', maxBitrate: 900_000, scalabilityMode: 'S1T3' }
  ],
  codecOptions: { videoGoogleStartBitrate: 1000 }
}
