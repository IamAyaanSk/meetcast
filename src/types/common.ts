import type { IceParameters, IceCandidate, DtlsParameters, MediaKind, RtpParameters } from 'mediasoup-client/types'

type TCreateWebRtcTransport = {
  isSender: boolean
  callback: (props: {
    id: string
    iceParameters: IceParameters
    iceCandidates: IceCandidate[]
    dtlsParameters: DtlsParameters
  }) => void
}

type TProduceMedia = {
  kind: MediaKind
  rtpParameters: RtpParameters
  callback: (params: { id: string }) => void
}

export type { TCreateWebRtcTransport, TProduceMedia }
