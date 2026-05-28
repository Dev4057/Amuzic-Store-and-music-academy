'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  )
}

const NO_NAV_PATHS = ['/teacher/login', '/teacher/change-password']

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [teacherName, setTeacherName] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Always reset to not-ready when path changes so spinner shows during every auth check
    setReady(false)

    if (pathname === '/teacher/login') {
      setReady(true)
      return
    }

    const supabase = getSupabase()
    void supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[TeacherLayout] pathname:', pathname)
      console.log('[TeacherLayout] session:', session ? 'exists' : 'null')

      if (!session) {
        console.log('[TeacherLayout] no session → redirect to login')
        router.replace('/teacher/login')
        return
      }

      const meta = session.user.user_metadata as {
        full_name?: string
        role?: string
        must_change_password?: boolean
      }

      console.log('[TeacherLayout] user_metadata:', JSON.stringify(meta))

      if (meta.role !== 'teacher') {
        console.log('[TeacherLayout] role is not teacher → sign out + redirect to login')
        void supabase.auth.signOut()
        router.replace('/teacher/login')
        return
      }

      const mustChange = meta.must_change_password ?? false
      console.log('[TeacherLayout] mustChange:', mustChange)

      if (mustChange && pathname !== '/teacher/change-password') {
        console.log('[TeacherLayout] mustChange=true, redirecting to change-password')
        router.replace('/teacher/change-password')
        return
      }

      if (!mustChange && pathname === '/teacher/change-password') {
        console.log('[TeacherLayout] mustChange=false on change-password, redirecting to dashboard')
        router.replace('/teacher/dashboard')
        return
      }

      console.log('[TeacherLayout] all checks passed → setReady(true)')
      setTeacherName(meta.full_name ?? session.user.email ?? 'Teacher')
      setReady(true)
    })
  }, [router, pathname])

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FAF8F2' }}>
        <span style={{ width: 24, height: 24, border: '2px solid #8B2E3F', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (NO_NAV_PATHS.includes(pathname)) {
    return <>{children}</>
  }

  const navLinks = [
    { href: '/teacher/dashboard', label: 'Dashboard' },
  ]

  async function handleSignOut() {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    router.replace('/teacher/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F2', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ background: '#2C1810', color: '#FAF8F2', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 600 }}>
            Amuzic <em style={{ color: '#C9A040', fontStyle: 'italic', fontWeight: 400 }}>Academy</em>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: pathname === link.href ? '#C9A040' : 'rgba(250,248,242,0.55)',
                  textDecoration: 'none',
                  fontSize: 13,
                  padding: '6px 12px',
                  borderRadius: 4,
                  fontWeight: pathname === link.href ? 600 : 400,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'rgba(250,248,242,0.55)' }}>{teacherName}</span>
          <button
            onClick={() => { void handleSignOut() }}
            style={{ fontSize: 12, color: 'rgba(250,248,242,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}
