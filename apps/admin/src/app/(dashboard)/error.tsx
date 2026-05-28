'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard render error:', error)
  }, [error])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <div style={{ fontSize: 32 }}>⚠</div>
      <div style={{ fontWeight: 700, fontSize: 18 }}>Something went wrong</div>
      <div style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 400, textAlign: 'center' }}>
        {error.message || 'An unexpected error occurred. Check the console for details.'}
      </div>
      <button className="btn btn-primary" onClick={reset}>
        Try Again
      </button>
    </div>
  )
}
