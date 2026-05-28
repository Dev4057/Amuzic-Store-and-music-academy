'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function PortalLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient(
        process.env['NEXT_PUBLIC_SUPABASE_URL']!,
        process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
      )
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError(authError.message); return }

      const role = data.user?.user_metadata?.['role'] as string | undefined
      if (role === 'director' || role === 'teacher') {
        await supabase.auth.signOut()
        setError('Please use the admin portal at the admin login page instead.')
        return
      }
      if (role !== 'student') {
        await supabase.auth.signOut()
        setError('Access denied. This portal is for students only.')
        return
      }
      window.location.href = '/portal/dashboard'
    } catch {
      setError('Could not connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF8F2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 600, color: '#2C1810', marginBottom: 6 }}>
            Amuzic <em style={{ color: '#8B2E3F', fontStyle: 'italic', fontWeight: 400 }}>Academy</em>
          </div>
          <div style={{ fontSize: 14, color: '#8B1A1A', fontWeight: 600, marginBottom: 4 }}>Student Portal</div>
          <div style={{ fontSize: 13, color: 'rgba(44,24,16,0.45)' }}>Sign in to view your progress, attendance &amp; fees</div>
        </div>

        {error && (
          <div style={{
            background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 6,
            padding: '10px 14px', fontSize: 13, color: '#991B1B', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid rgba(44,24,16,0.08)', borderRadius: 8, padding: 28, boxShadow: '0 2px 12px rgba(44,24,16,0.06)' }}>
          <form onSubmit={(e) => { void handleSubmit(e) }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2C1810', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(44,24,16,0.15)', borderRadius: 5, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2C1810', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(44,24,16,0.15)', borderRadius: 5, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px 16px', background: '#8B2E3F', color: '#FAF8F2',
                border: 'none', borderRadius: 5, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(44,24,16,0.35)', marginTop: 20 }}>
          Don&apos;t have access? Contact the academy at{' '}
          <a href="tel:+918975916381" style={{ color: '#8B2E3F', textDecoration: 'none' }}>+91 89759 16381</a>
        </p>
      </div>
    </div>
  )
}
