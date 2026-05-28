'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { PageHeader } from '../../../components/PageHeader'
import { RoleGuard } from '../../../components/RoleGuard'
import { useFinancials } from '../../../hooks/useFinancials'
import { formatCurrency, formatPhone } from '@amuzic/shared'

const TrendChart = dynamic(() => import('../../../components/financials/TrendChart'), { ssr: false })
const CourseBarChart = dynamic(() => import('../../../components/financials/CourseBarChart'), { ssr: false })
const PaymentModeChart = dynamic(() => import('../../../components/financials/PaymentModeChart'), { ssr: false })

function pct(curr: number, prev: number): { value: string; up: boolean } {
  if (prev === 0) return { value: curr > 0 ? '+100%' : '—', up: curr >= 0 }
  const diff = ((curr - prev) / prev) * 100
  return { value: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`, up: diff >= 0 }
}

interface CompareCardProps { label: string; curr: number; prev: number; isCurrency?: boolean }

function CompareCard({ label, curr, prev, isCurrency = true }: CompareCardProps) {
  const change = pct(curr, prev)
  return (
    <div className="stat-card" style={{ flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{isCurrency ? formatCurrency(curr) : curr}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
        vs {isCurrency ? formatCurrency(prev) : prev} last month
      </div>
      <div style={{ fontSize: 12, marginTop: 4, color: change.up ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
        {change.up ? '↑' : '↓'} {change.value}
      </div>
    </div>
  )
}

export default function FinancialsPage() {
  const { data, isLoading } = useFinancials()

  return (
    <RoleGuard allowedRoles={['director']}>
      <PageHeader
        title="Financials"
        description="Revenue analytics, payment trends, and pending dues"
      />

      {isLoading ? (
        <div className="loading-center"><span className="spinner" /> Loading financials…</div>
      ) : !data ? null : (
        <>
          {/* This month vs last month comparison */}
          <section style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>This Month vs Last Month</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <CompareCard label="Collected" curr={data.this_month.collected} prev={data.last_month.collected} />
              <CompareCard label="Pending" curr={data.this_month.pending} prev={data.last_month.pending} />
              <CompareCard label="Overdue" curr={data.this_month.overdue} prev={data.last_month.overdue} />
              <CompareCard label="New Admissions" curr={data.this_month.new_admissions} prev={data.last_month.new_admissions} isCurrency={false} />
              <CompareCard label="Admission Fees" curr={data.this_month.admission_fees_collected} prev={data.last_month.admission_fees_collected} />
            </div>
          </section>

          {/* Monthly trend + payment mode side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 24, alignItems: 'start' }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>6-Month Collection Trend</div>
              <TrendChart data={data.monthly_trend} />
            </div>
            <div className="card" style={{ padding: 20, minWidth: 280 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Payment Mode Breakdown</div>
              <PaymentModeChart data={data.payment_mode_breakdown} />
            </div>
          </div>

          {/* Collection by course + top pending side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Collection by Course</div>
              {data.collection_by_course.length > 0 ? (
                <CourseBarChart data={data.collection_by_course} />
              ) : (
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>No data yet</div>
              )}
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Top Pending Students</div>
              {data.top_pending_students.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>All caught up — no pending dues!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {data.top_pending_students.map((s) => (
                    <div key={s.student_id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.full_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{formatPhone(s.phone)}</div>
                        {s.overdue_count > 0 && (
                          <span className="badge badge-red" style={{ marginTop: 2 }}>{s.overdue_count} overdue</span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: '#DC2626' }}>{formatCurrency(s.total_pending)}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4, justifyContent: 'flex-end' }}>
                          <a
                            href={`https://wa.me/91${s.phone}?text=${encodeURIComponent(`Hi ${s.full_name}, your music class fee at Amuzic Academy is pending. Please contact us at +91 89759 16381.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success btn-sm"
                          >
                            Remind
                          </a>
                          <Link href={`/students/${s.student_id}?tab=fees`} className="btn btn-ghost btn-sm">
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </RoleGuard>
  )
}
