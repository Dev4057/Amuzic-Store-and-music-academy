'use client'

import Link from 'next/link'
import { useDashboard } from '../../../hooks/useDashboard'
import { formatCurrency, formatDate } from '@amuzic/shared'

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard()
  const d = data?.data

  if (isLoading) {
    return (
      <>
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Today&apos;s overview</p>
          </div>
        </div>
        <div className="stats-row">
          {[1,2,3,4].map((i) => (
            <div key={i} className="stat-card">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            </div>
          ))}
        </div>
        <div className="loading-center"><span className="spinner" /> Loading…</div>
      </>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        Failed to load dashboard. Is the API running?
      </div>
    )
  }

  const todayName = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{todayName}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{d?.total_active_students ?? 0}</div>
          <div className="stat-label">Active Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: d?.total_pending_fees ? '#DC2626' : 'var(--ink)' }}>
            {formatCurrency(d?.total_pending_fees ?? 0)}
          </div>
          <div className="stat-label">Pending Fees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{d?.demos_booked_this_month ?? 0}</div>
          <div className="stat-label">Demos This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--burgundy)' }}>
            {formatCurrency(d?.fee_collection_this_month ?? 0)}
          </div>
          <div className="stat-label">Collected This Month</div>
        </div>
      </div>

      {/* Overdue alert */}
      {(d?.overdue_fees_count ?? 0) > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          <strong>⚠ {d!.overdue_fees_count} student{d!.overdue_fees_count !== 1 ? 's' : ''} have overdue fees</strong>{' '}
          <Link href="/fees?status=overdue" style={{ color: '#92400E', fontWeight: 600, textDecoration: 'underline' }}>
            View overdue →
          </Link>
        </div>
      )}

      {/* Today's classes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div className="section-title">Today&apos;s Classes</div>
          <div className="card">
            {(d?.todays_classes?.length ?? 0) === 0 ? (
              <div className="empty-state" style={{ padding: '32px 24px' }}>
                <div className="empty-state-icon">○</div>
                <div className="empty-state-title" style={{ fontSize: 14 }}>No classes today</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Batch</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d?.todays_classes.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <Link href={`/batches/${c.id}`} style={{ fontWeight: 600, color: 'var(--burgundy)', textDecoration: 'none' }}>
                            {c.name}
                          </Link>
                        </td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{c.schedule_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Quick Links</span>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '/students', label: 'Manage Students', icon: '◎' },
                { href: '/batches', label: 'View Batches', icon: '◈' },
                { href: '/attendance', label: 'Mark Attendance', icon: '✓' },
                { href: '/demos', label: 'Demo Bookings', icon: '◇' },
                { href: '/fees', label: 'Fee Management', icon: '₹' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    textDecoration: 'none',
                    color: 'var(--ink)',
                    fontSize: 14,
                    fontWeight: 500,
                    transition: 'border-color 0.15s',
                  }}
                >
                  <span style={{ color: 'var(--muted)' }}>{item.icon}</span>
                  {item.label}
                  <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 16 }}>›</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
