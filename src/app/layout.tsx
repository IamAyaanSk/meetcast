import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { VideoIcon } from 'lucide-react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Meetcast',
  description: 'A video conferencing app with hls live playback'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-gray-900 text-white ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="flex items-center justify-between py-4 px-6 bg-gray-800 border-b border-gray-700">
          <h1 className="text-2xl font-mono text-cyan-300 font-bold flex justify-center items-center gap-3">
            <VideoIcon />
            MeetCast
          </h1>
          <p className="text-sm font-bold text-cyan-500">Made by Ayaan</p>
        </header>{' '}
        {children}
      </body>
    </html>
  )
}
