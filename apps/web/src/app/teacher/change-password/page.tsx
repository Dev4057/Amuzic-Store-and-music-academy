'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  )
}

export default function TeacherChangePasswordPage() {
  const router = useRouter()
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
      const supabase = getSupabase()
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
        data: { must_change_password: false },
      })
      if (updateError) { setError(updateError.message); return }
      // Refresh session so the new JWT reflects must_change_password: false
      // before the dashboard layout reads it
      await supabase.auth.refreshSession()
      router.replace('/teacher/dashboard')
    } catch {
      setError('Could not update password. Please try again.')
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
          <div style={{ fontSize: 14, color: '#8B1A1A', fontWeight: 600, marginBottom: 4 }}>Set Your Password</div>
          <div style={{ fontSize: 13, color: 'rgba(44,24,16,0.45)' }}>Choose a new password to secure your account</div>
        </div>

        <div style={{
          background: 'rgba(139,46,63,0.06)', border: '1px solid rgba(139,46,63,0.15)',
          borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#8B2E3F', marginBottom: 20,
        }}>
          Your initial password has expired. Please set a new password to continue.
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
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(44,24,16,0.15)', borderRadius: 5, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2C1810', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(44,24,16,0.15)', borderRadius: 5, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              style={{
                width: '100%', padding: '11px 16px', background: '#8B2E3F', color: '#FAF8F2',
                border: 'none', borderRadius: 5, fontSize: 14, fontWeight: 600,
                cursor: loading || !newPassword || !confirmPassword ? 'not-allowed' : 'pointer',
                opacity: loading || !newPassword || !confirmPassword ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving…' : 'Set Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
