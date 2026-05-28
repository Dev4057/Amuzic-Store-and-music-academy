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

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [studentName, setStudentName] = useState<string>('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/portal/login'); return }
      const meta = session.user.user_metadata as { full_name?: string; role?: string }
      if (meta.role !== 'student') { router.replace('/portal/login'); return }
      setStudentName(meta.full_name ?? session.user.email ?? 'Student')
      setChecking(false)
    })
  }, [router])

  async function handleSignOut() {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    router.replace('/portal/login')
  }

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FAF8F2' }}>
        <span style={{ width: 24, height: 24, border: '2px solid #8B2E3F', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  const navLinks = [
    { href: '/portal/dashboard', label: 'Dashboard' },
    { href: '/portal/dashboard/attendance', label: 'Attendance' },
    { href: '/portal/dashboard/fees', label: 'Fees' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F2', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top navbar */}
      <nav style={{ background: '#2C1810', color: '#FAF8F2', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 600 }}>
            Amuzic <em style={{ color: '#C9A040', fontStyle: 'italic', fontWeight: 400 }}>Portal</em>
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
          <span style={{ fontSize: 13, color: 'rgba(250,248,242,0.55)' }}>{studentName}</span>
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

      {/* Mobile bottom nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#2C1810', display: 'flex', borderTop: '1px solid rgba(250,248,242,0.1)' }} className="md:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              flex: 1,
              textAlign: 'center',
              color: pathname === link.href ? '#C9A040' : 'rgba(250,248,242,0.45)',
              textDecoration: 'none',
              fontSize: 11,
              padding: '10px 4px',
              fontWeight: pathname === link.href ? 600 : 400,
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
