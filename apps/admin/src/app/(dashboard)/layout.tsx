'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { useEffect } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '⬛', roles: ['director'] },
  { href: '/students', label: 'Students', icon: '◎', roles: ['director', 'teacher'] },
  { href: '/batches', label: 'Batches', icon: '◈', roles: ['director', 'teacher'] },
  { href: '/attendance', label: 'Attendance', icon: '✓', roles: ['director', 'teacher'] },
  { href: '/fees', label: 'Fees', icon: '₹', roles: ['director'] },
  { href: '/demos', label: 'Demo Bookings', icon: '◇', roles: ['director', 'teacher'] },
  { href: '/teachers', label: 'Teachers', icon: '⬤', roles: ['director'] },
  { href: '/products', label: 'Products', icon: '◈', roles: ['director'] },
  { href: '/reports', label: 'Reports', icon: '▣', roles: ['director'] },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, isLoading, signOut } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
    if (!isLoading && user && role === 'teacher' && pathname === '/dashboard') {
      router.replace('/students')
    }
  }, [user, role, isLoading, router, pathname])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span className="spinner" />
      </div>
    )
  }

  if (!user) return null

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(role ?? ''))

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-name">
            Amuzic <em>Admin</em>
          </div>
          <div className="admin-brand-sub">Store & Academy</div>
        </div>

        <nav className="admin-nav-section">
          <div className="admin-nav-label">Manage</div>
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link${pathname.startsWith(item.href) ? ' active' : ''}`}
            >
              <span style={{ fontSize: 14, opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid rgba(250,248,242,0.07)' }}>
          <div style={{ fontSize: 12, color: 'rgba(250,248,242,0.4)', marginBottom: 8 }}>
            {role === 'director' ? 'Director' : 'Teacher'}
          </div>
          <button
            onClick={() => { void signOut() }}
            className="admin-nav-link"
            style={{ padding: '8px 0', border: 'none', fontSize: 12, opacity: 0.4, background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            ← Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}
