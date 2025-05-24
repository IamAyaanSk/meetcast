'use client'

import { io, Socket } from 'socket.io-client'
import { ServerToClientEvents, ClientToServerEvents } from '@/types/socket'
import { SOCKET_SERVER_URL } from '@/constants/global'

// Since this is a minimal example, I am using a simple specifier token to proof that this is a frontend socket client
// ( This should be more secured in a production app but this is not the focus of this app )

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_SERVER_URL, {
  extraHeaders: {
    authorization: `Bearer ${process.env.NEXT_PUBLIC_FRONTEND_SPECIFIER_SECRET}`
  }
})
