'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json() as {
        session?: { access_token: string }
        user?: { id: string; role: string; full_name: string; email: string; must_change_password?: boolean }
        error?: string | { message?: string }
      }

      if (!res.ok) {
        const errMsg = typeof data.error === 'object' ? (data.error?.message ?? 'Login failed.') : (data.error ?? 'Login failed. Check your credentials.')
        setError(errMsg)
        return
      }

      if (data.user?.role !== 'director' && data.user?.role !== 'teacher') {
        setError('Access denied. Staff account required.')
        return
      }

      localStorage.setItem('admin_token', data.session!.access_token)
      localStorage.setItem('admin_user', JSON.stringify({
        id: data.user.id,
        full_name: data.user.full_name,
        role: data.user.role,
        email: data.user.email,
        must_change_password: data.user.must_change_password ?? false,
      }))
      document.cookie = `admin_auth=1; path=/; max-age=${60 * 60 * 24 * 7}`

      if (data.user.must_change_password) {
        window.location.href = '/change-password'
      } else {
        window.location.href = data.user.role === 'director' ? '/dashboard' : '/students'
      }
    } catch {
      setError('Could not connect to the server. Make sure the API is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
            Amuzic <em style={{ color: 'var(--burgundy)', fontStyle: 'italic', fontWeight: 400 }}>Admin</em>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Sign in with your staff account</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={(e) => { void handleSubmit(e) }}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@amuzic.in"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '11px 16px' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</> : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--muted)' }}>
          Amuzic Store & Music Academy — Internal Tool
        </div>
      </div>
    </div>
  )
}
