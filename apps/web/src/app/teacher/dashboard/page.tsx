'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

interface TeacherMeta {
  full_name?: string
  role?: string
}

export default function TeacherDashboardPage() {
  const [teacherName, setTeacherName] = useState('')

  useEffect(() => {
    const supabase = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    )
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      const meta = session.user.user_metadata as TeacherMeta
      setTeacherName(meta.full_name ?? session.user.email ?? 'Teacher')
    })
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 600, color: '#2C1810', margin: 0 }}>
          Welcome back, {teacherName || '…'}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(44,24,16,0.5)', marginTop: 6 }}>
          Your teacher portal — batches and schedules coming soon.
        </p>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid rgba(44,24,16,0.08)',
        borderRadius: 8,
        padding: 32,
        textAlign: 'center',
        color: 'rgba(44,24,16,0.4)',
        fontSize: 14,
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🎵</div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Your dashboard is being set up</div>
        <div>Batch schedules, student attendance, and more will appear here.</div>
      </div>
    </div>
  )
}
