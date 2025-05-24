## MeetCast

Meet cast allows you to join a call ( supports audio and video interactions ) and makes the live hls stream of your ongoing call available. 
This is the frontend part that it is integrated with the meetcast-server ( Mediasoup based SFU server ) and meetcast-recorder ( Express server which converts stream to hls and serve to frontend ). 

### MeetCast demo 

<img width="500" alt="Home page" src="https://github.com/user-attachments/assets/72709146-aee0-408d-bd35-90beed315f94" />
<img width="500" alt="Stream page" src="https://github.com/user-attachments/assets/58aee23b-2cfa-42e6-8d94-ff015e414197" />
<img width="500" alt="Watch Page" src="https://github.com/user-attachments/assets/d9df95ca-cb10-4a4f-aead-db2e555bc77d" />
<img width="500" alt="Watch page no stream" src="https://github.com/user-attachments/assets/03a6a023-90f2-4140-80d4-519cfdc8ed1d" />

### Features 

- Intutive meet interface allowing users to control self and view participants streams.
- Uses Socket.io to implement the signalling part with meetcast-server ( SFU server ).
- Participants can view all participants in a grid like view.
- Proper producer ( self ), transports, consumers management.
- Realtime participant connection and disconnection management.
- live status indicator once hls stream is available.
- Implements a basic authentication for protecting someone trying to join as unauthorized recorder.
- Provides a hls player which displays call live stream. ( around 10s - 12s latency ).
- Multiple users can join the call and the hls stream is broadcasted to multiple users.

### Stream page 

The stream page help users to initialize a call ( if no other users are connected ) or join one. Once the user joins the call he can then view and interact all other participants. New participants can join an ongoing call and it is managed in realtime providing a seamless experience. Also participants can control their audio and video produce using buttons. A live stream indicator appears ( genrally after sometime once a new call begins ) when a livestream for the call is available at the `/watch` page.

### Watch page 

The watch page plays the hls stream received from the meetcast-recorder server usin hls.js package. A user can interact with this player and can view any previous timestamp, see and hear participants interacting over the call, controlling audio levels, playback speed. When a call ends and there are no active participants it loads an intutive loading state.

### Tech stack ( whole app ) 

#### Frontend 
- Nextjs
- Typescript
- hls.js
- Tailwindcss
- Shadcn
- Socket.io client
- Mediasoup client

#### [Recorder](https://github.com/IamAyaanSk/meetcast-recorder)
- Nodejs
- Typescript
- Socket.io client
- Puppeteer 
- FFMPEG
- Express

#### [SFU](https://github.com/IamAyaanSk/meetcast-server)
- Nodejs
- Typescript
- Socket.io
- Mediasoup

### Installation 

1. Clone this repository.
2. Install dependencies
   `pnpm install`
3. Set env variables
   Refer the `.env.example` file for setup.
4. Configure the recorder and SFU server too ( check readme pf specific repositories for more information )
5. To start the serrver in dev mode
   `pnpm dev`
6. To start in prod mode
   `pnpm build && pnpm start`

### Roadmap 
It was a really awesome project to build. Handling various cases, learning about WebRtc ( SFU architecture mainly ), Mediasoup, signalling mechanisem, ffmpeg, hls and so much more. Here is a basic overview about how I started and advanced to build MeetCast. 

1. Gather information about WebRtc, what was it, why it is used an overview of how it is used.
2. Learned about SFU architecture for efficient WebRtc apps.
3. Got a grasp about how to setup the connection and start consuming and producing using Mediasoup.
4. Coded the whole `/stream` path which allowed multiple users to join to the call.
5. Now I wanted an effective way to record the call. I had two options:
   - Use server side processing by consuming plain RTP streams from my Mediasoup server.
   - Use an actual browser instance to create a special call participant which records it.
   I decided to go ith the later option due to the following disadvantages in the first one:
      - Mixing multiple streams and getting a matching layout was too complex and would shift me towards the MCU architecture.
      - Although if I went this way, streaming the actual layout of the call won't seemed feasible to me.
   Now the second option, seemed to be more feasible for my cause. I created the recorder server which joins the SFU with socket and starts and ends recording as commanded. ( It could    be also scalble if we assign a single room with such a recorder docker container ).
6. Now I created the recorder server and piped the stream to ffmpeg to generate the hls live stream.
7. I added a http endpoint on this recorder server which serves the live stream to the client.
8. After placing all the places together I added some basic security measures on each layer.
9. Finally I tested the application as a whole and made required enhancements.

## Author 
### Ayaan Shaikh
