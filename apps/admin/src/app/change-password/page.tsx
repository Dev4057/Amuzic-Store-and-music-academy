'use client'

import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function ChangePasswordPage() {
  const { user, role } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'
      const res = await fetch(`${apiUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ new_password: newPassword }),
      })
      const data = await res.json() as { message?: string; error?: string | { message?: string } }
      if (!res.ok) {
        const errMsg = typeof data.error === 'object' ? (data.error?.message ?? 'Failed to update password.') : (data.error ?? 'Failed to update password.')
        setError(errMsg)
        return
      }

      // Update localStorage so must_change_password is cleared
      const stored = localStorage.getItem('admin_user')
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, unknown>
        localStorage.setItem('admin_user', JSON.stringify({ ...parsed, must_change_password: false }))
      }

      window.location.href = role === 'director' ? '/dashboard' : '/students'
    } catch {
      setError('Could not connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, background: 'var(--cream, #FAF8F2)', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink, #2C1810)', marginBottom: 4 }}>
            Amuzic <em style={{ color: 'var(--burgundy, #8B2E3F)', fontStyle: 'italic', fontWeight: 400 }}>Admin</em>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink, #2C1810)', marginBottom: 4 }}>Set Your Password</div>
          <div style={{ fontSize: 13, color: 'var(--muted, rgba(44,24,16,0.45))' }}>
            {user?.full_name ? `Hi ${user.full_name} — choose` : 'Choose'} a new password to secure your account
          </div>
        </div>

        <div style={{ background: 'rgba(139,46,63,0.06)', border: '1px solid rgba(139,46,63,0.15)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#8B2E3F', marginBottom: 20 }}>
          Your initial password has expired. Please set a new password to continue.
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
        )}

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={(e) => { void handleSubmit(e) }}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !newPassword || !confirmPassword}
              style={{ width: '100%', justifyContent: 'center', padding: '11px 16px' }}
            >
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : 'Set Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
