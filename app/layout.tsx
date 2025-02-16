import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shitcoin Scanner - Real-time Solana Token Scanner',
  description: 'Scan and analyze Solana tokens in real-time without leaving X. Get instant price data and 4-hour charts.',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}