import type { Metadata } from 'next'
import { AuthProvider } from '../providers/AuthProvider'
import { QueryProvider } from '../providers/QueryProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Admin — Amuzic Store & Music Academy',
  description: 'Internal management dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
