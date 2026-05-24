'use client'

import { useState } from 'react'
import { useFees, useCreateFee, useRecordPayment, useGenerateMonthlyFees } from '../../../hooks/useFees'
import { RoleGuard } from '../../../components/RoleGuard'
import { EmptyState } from '../../../components/EmptyState'
import { PageHeader } from '../../../components/PageHeader'
import { useToast } from '../../../components/Toast'
import { formatCurrency, formatDate } from '@amuzic/shared'
import type { FeeStatus, FeeRecord } from '@amuzic/shared'

const STATUS_BADGE: Record<FeeStatus, string> = {
  pending: 'badge-amber',
  paid: 'badge-green',
  overdue: 'badge-red',
  waived: 'badge-gray',
}

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Paid', value: 'paid' },
  { label: 'Waived', value: 'waived' },
]

interface FeeWithStudent extends FeeRecord {
  students: { full_name: string; phone: string } | null
}

export default function FeesPage() {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [showGenDialog, setShowGenDialog] = useState(false)
  const [genMonth, setGenMonth] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [genDue, setGenDue] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1); d.setDate(10)
    return d.toISOString().split('T')[0]!
  })
  const [showPayDialog, setShowPayDialog] = useState(false)
  const [payFee, setPayFee] = useState<FeeWithStudent | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]!)
  const [payMode, setPayMode] = useState('cash')
  const [payNotes, setPayNotes] = useState('')

  const { data, isLoading, refetch } = useFees({
    status: statusFilter || undefined,
    search: search || undefined,
    month_year: monthFilter || undefined,
  })
  const generateFees = useGenerateMonthlyFees()
  const recordPayment = useRecordPayment(payFee?.id ?? '')

  const fees = (data?.fees ?? []) as FeeWithStudent[]
  const summary = data?.summary
  const total = data?.total ?? 0

  async function handleGenerate() {
    try {
      const result = await generateFees.mutateAsync({ month_year: genMonth, due_date: genDue })
      toast(`Generated ${result.created} fees (${result.skipped} skipped — already existed)`)
      setShowGenDialog(false)
      void refetch()
    } catch {
      toast('Failed to generate fees', 'error')
    }
  }

  async function handleRecordPayment() {
    if (!payFee || !payAmount) return
    try {
      await recordPayment.mutateAsync({
        paid_amount: Number(payAmount),
        paid_date: payDate,
        payment_mode: payMode,
        notes: payNotes || undefined,
      })
      toast('Payment recorded')
      setShowPayDialog(false)
      setPayFee(null)
      void refetch()
    } catch {
      toast('Failed to record payment', 'error')
    }
  }

  return (
    <>
      <PageHeader
        title={`Fees${total ? ` (${total})` : ''}`}
        description="Track and manage student fee records"
        action={
          <RoleGuard allowedRoles={['director']}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowGenDialog(true)}>Generate Monthly</button>
            </div>
          </RoleGuard>
        }
      />

      {/* Summary strip */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{summary?.pending_count ?? 0}</div>
          <div className="stat-label">Pending</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{formatCurrency(summary?.pending_amount ?? 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#DC2626' }}>{summary?.overdue_count ?? 0}</div>
          <div className="stat-label">Overdue</div>
          <div style={{ fontSize: 13, marginTop: 4, color: '#DC2626' }}>{formatCurrency(summary?.overdue_amount ?? 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#16A34A' }}>{formatCurrency(summary?.collected_this_month ?? 0)}</div>
          <div className="stat-label">Collected This Month</div>
        </div>
      </div>

      {/* Filters */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search by student name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          style={{ width: 180 }}
        />
      </div>

      <div className="filter-tabs">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            className={`filter-tab${statusFilter === t.value ? ' active' : ''}`}
            onClick={() => setStatusFilter(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {isLoading ? (
          <div className="loading-center"><span className="spinner" /> Loading fees…</div>
        ) : fees.length === 0 ? (
          <EmptyState icon="₹" title="No fee records found" description="Generate monthly fees or add records manually" />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Month</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{f.students?.full_name ?? '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{f.students?.phone}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{f.month_year ?? '—'}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{f.fee_type}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(f.amount)}</td>
                    <td style={{ fontSize: 13 }}>{formatDate(f.due_date)}</td>
                    <td style={{ fontSize: 13 }}>{f.paid_date ? formatDate(f.paid_date) : '—'}</td>
                    <td style={{ fontSize: 13, textTransform: 'capitalize' }}>{f.payment_mode?.replace('_', ' ') ?? '—'}</td>
                    <td><span className={`badge ${STATUS_BADGE[f.status as FeeStatus] ?? 'badge-gray'}`}>{f.status}</span></td>
                    <td>
                      {(f.status === 'pending' || f.status === 'overdue') && (
                        <RoleGuard allowedRoles={['director']}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              setPayFee(f)
                              setPayAmount(String(f.amount))
                              setShowPayDialog(true)
                            }}
                          >
                            Pay
                          </button>
                        </RoleGuard>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate monthly dialog */}
      {showGenDialog && (
        <div className="dialog-overlay" onClick={() => setShowGenDialog(false)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="dialog-title">Generate Monthly Fees</div>
            <div className="dialog-body">
              Creates fee records for all active students with active batch enrollments. Skips students who already have a record for the selected month.
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Month / Year</label>
              <input type="month" value={genMonth} onChange={(e) => setGenMonth(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Due Date</label>
              <input type="date" value={genDue} onChange={(e) => setGenDue(e.target.value)} />
            </div>
            <div className="dialog-actions">
              <button className="btn btn-ghost" onClick={() => setShowGenDialog(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { void handleGenerate() }} disabled={generateFees.isPending}>
                {generateFees.isPending ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record payment dialog */}
      {showPayDialog && payFee && (
        <div className="dialog-overlay" onClick={() => setShowPayDialog(false)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">Record Payment</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
              {payFee.students?.full_name} · {payFee.month_year}
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Amount (₹)</label>
              <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} min={1} />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Payment Date</label>
              <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Payment Mode</label>
              <select value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Notes (optional)</label>
              <input type="text" value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
            </div>
            <div className="dialog-actions">
              <button className="btn btn-ghost" onClick={() => { setShowPayDialog(false); setPayFee(null) }}>Cancel</button>
              <button className="btn btn-success" onClick={() => { void handleRecordPayment() }} disabled={recordPayment.isPending}>
                {recordPayment.isPending ? 'Saving…' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
