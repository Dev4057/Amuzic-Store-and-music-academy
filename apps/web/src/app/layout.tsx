import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://amuzicacademy.in'),
  title: {
    default: 'Amuzic Store & Music Academy — Bavdhan, Pune',
    template: '%s | Amuzic Academy',
  },
  description:
    'Learn keyboard, guitar, drums & vocals at Amuzic Music Academy in Bavdhan, Pune. Also shop curated instruments at the Amuzic Store. Expert teachers, structured curriculum, all age groups.',
  keywords: [
    'music classes Pune',
    'music academy Bavdhan',
    'keyboard classes Pune',
    'guitar classes Pune',
    'drums classes Pune',
    'vocal classes Pune',
    'music school Kothrud',
    'music lessons Baner',
    'Amuzic Academy',
  ],
  openGraph: {
    siteName: 'Amuzic Academy',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
