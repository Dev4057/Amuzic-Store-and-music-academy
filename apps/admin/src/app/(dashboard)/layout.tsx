'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  GraduationCap,
  Layers,
  CalendarCheck,
  IndianRupee,
  TrendingUp,
  CalendarDays,
  UserCog,
  Package,
  FileBarChart,
  MessageSquare,
  PenLine,
  type LucideIcon,
} from 'lucide-react'

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon; roles: string[] }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['director'] },
  { href: '/students', label: 'Students', icon: GraduationCap, roles: ['director', 'teacher'] },
  { href: '/batches', label: 'Batches', icon: Layers, roles: ['director', 'teacher'] },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['director', 'teacher'] },
  { href: '/fees', label: 'Fees', icon: IndianRupee, roles: ['director'] },
  { href: '/financials', label: 'Financials', icon: TrendingUp, roles: ['director'] },
  { href: '/demos', label: 'Demo Bookings', icon: CalendarDays, roles: ['director', 'teacher'] },
  { href: '/teachers', label: 'Teachers', icon: UserCog, roles: ['director'] },
  { href: '/products', label: 'Products', icon: Package, roles: ['director'] },
  { href: '/reports', label: 'Reports', icon: FileBarChart, roles: ['director'] },
  { href: '/testimonials', label: 'Testimonials', icon: MessageSquare, roles: ['director'] },
  { href: '/blog', label: 'Blog', icon: PenLine, roles: ['director'] },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, isLoading, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
    if (!isLoading && user && user.must_change_password) {
      router.replace('/change-password')
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
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.jpeg" alt="Amuzic" width={28} height={28} style={{ borderRadius: 6, objectFit: 'cover', display: 'block' }} />
          <div className="admin-brand-name">
            Amuzic <em>Admin</em>
          </div>
        </div>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={() => setIsMobileMenuOpen(true)}
          style={{ padding: '8px', border: 'none', color: 'var(--ink)' }}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="admin-sidebar-overlay" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.jpeg" alt="Amuzic" width={36} height={36} style={{ borderRadius: 8, objectFit: 'cover', display: 'block' }} />
            <div>
              <div className="admin-brand-name">
                Amuzic <em>Admin</em>
              </div>
              <div className="admin-brand-sub">Store & Academy</div>
            </div>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="admin-nav-section">
          <div className="admin-nav-label">Manage</div>
          {visibleNav.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link${pathname.startsWith(item.href) ? ' active' : ''}`}
              >
                <Icon size={15} style={{ opacity: 0.7, flexShrink: 0 }} />
                {item.label}
              </Link>
            )
          })}
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
