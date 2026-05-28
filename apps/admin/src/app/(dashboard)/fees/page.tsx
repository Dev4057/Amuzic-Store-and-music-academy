'use client'

import { useState, useEffect, useRef } from 'react'
import { useFees, useCreateFee, useRecordPayment, useGenerateMonthlyFees, useFeeReminders } from '../../../hooks/useFees'
import { useStudents } from '../../../hooks/useStudents'
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
  const [showAddFeeDialog, setShowAddFeeDialog] = useState(false)
  const [addStudentSearch, setAddStudentSearch] = useState('')
  const [addStudentId, setAddStudentId] = useState('')
  const [addStudentName, setAddStudentName] = useState('')
  const [addFeeType, setAddFeeType] = useState('monthly')
  const [addAmount, setAddAmount] = useState('')
  const [addMonthYear, setAddMonthYear] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [addDueDate, setAddDueDate] = useState(() => {
    const d = new Date(); d.setDate(10)
    return d.toISOString().split('T')[0]!
  })
  const [addNotes, setAddNotes] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
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
  const [downloadingReceipt, setDownloadingReceipt] = useState<Record<string, boolean>>({})

  const { data, isLoading, refetch } = useFees({
    status: statusFilter || undefined,
    search: search || undefined,
    month_year: monthFilter || undefined,
  })
  const { data: reminders } = useFeeReminders()
  const generateFees = useGenerateMonthlyFees()
  const createFee = useCreateFee()
  const recordPayment = useRecordPayment(payFee?.id ?? '')

  const { data: studentSearchData } = useStudents({
    search: addStudentSearch.length >= 2 ? addStudentSearch : undefined,
  })
  const studentSuggestions = (studentSearchData?.students ?? []).slice(0, 6)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function resetAddFeeForm() {
    setAddStudentSearch('')
    setAddStudentId('')
    setAddStudentName('')
    setAddFeeType('monthly')
    setAddAmount('')
    setAddNotes('')
    setShowDropdown(false)
  }

  const fees = (data?.fees ?? []) as FeeWithStudent[]
  const summary = data?.summary
  const total = data?.total ?? 0

  async function handleAddFee() {
    if (!addStudentId || !addAmount) return
    try {
      await createFee.mutateAsync({
        student_id: addStudentId,
        fee_type: addFeeType as 'monthly' | 'admission' | 'annual' | 'exam' | 'other',
        amount: Number(addAmount),
        due_date: addDueDate,
        month_year: addFeeType === 'monthly' ? addMonthYear : undefined,
        status: 'pending',
        notes: addNotes || undefined,
      })
      toast(`Fee added for ${addStudentName}`)
      setShowAddFeeDialog(false)
      resetAddFeeForm()
      void refetch()
    } catch {
      toast('Failed to add fee record', 'error')
    }
  }

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

  async function handleDownloadReceipt(fee: FeeWithStudent) {
    setDownloadingReceipt((p) => ({ ...p, [fee.id]: true }))
    try {
      const [{ pdf }, { FeeReceiptPdf }, React] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../../../components/pdf/generators/FeeReceiptPdf'),
        import('react'),
      ])
      const student = {
        id: fee.student_id,
        full_name: fee.students?.full_name ?? 'Unknown',
        phone: fee.students?.phone ?? '',
        enrollment_date: '',
        status: 'active' as const,
        created_at: '',
      }
      const element = React.createElement(FeeReceiptPdf, { student, fee })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(element as any).toBlob()
      const receiptNo = `FEE-${fee.id.slice(0, 8).toUpperCase()}`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${receiptNo}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF receipt error:', err)
      toast('Failed to generate receipt', 'error')
    } finally {
      setDownloadingReceipt((p) => ({ ...p, [fee.id]: false }))
    }
  }

  const dueSoonCount = reminders?.due_soon?.length ?? 0
  const missingCount = reminders?.missing_this_month?.length ?? 0

  return (
    <>
      <PageHeader
        title={`Fees${total ? ` (${total})` : ''}`}
        description="Track and manage student fee records"
        action={
          <RoleGuard allowedRoles={['director']}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowGenDialog(true)}>Generate Monthly</button>
              <button className="btn btn-primary" onClick={() => setShowAddFeeDialog(true)}>+ Add Fee</button>
            </div>
          </RoleGuard>
        }
      />

      {/* ── Reminders panel ─────────────────────────────────────────── */}
      {(dueSoonCount > 0 || missingCount > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>

          {/* Fees due within 7 days */}
          {dueSoonCount > 0 && (
            <div style={{
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(217,119,6,0.3)',
              borderLeft: '4px solid #D97706',
              borderRadius: 8,
              padding: '14px 16px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E', marginBottom: 10 }}>
                ⏰ {dueSoonCount} fee{dueSoonCount > 1 ? 's' : ''} due within 7 days
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {reminders!.due_soon.map((f) => (
                  <span key={f.id} style={{
                    padding: '3px 10px',
                    background: 'rgba(217,119,6,0.1)',
                    borderRadius: 20,
                    fontSize: 12,
                    color: '#92400E',
                    fontWeight: 500,
                  }}>
                    {f.students?.full_name} · {formatCurrency(f.amount)} · due {formatDate(f.due_date)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Enrolled students missing fees this month */}
          {missingCount > 0 && (
            <div style={{
              background: 'rgba(139,46,63,0.05)',
              border: '1px solid rgba(139,46,63,0.2)',
              borderLeft: '4px solid var(--burgundy)',
              borderRadius: 8,
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--burgundy)', marginBottom: 4 }}>
                  ◈ {missingCount} enrolled student{missingCount > 1 ? 's' : ''} have no fees for {reminders!.current_month}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {reminders!.missing_this_month.slice(0, 5).map((s) => s.full_name).join(', ')}
                  {missingCount > 5 ? ` +${missingCount - 5} more` : ''}
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setGenMonth(reminders!.current_month)
                  setShowGenDialog(true)
                }}
              >
                Generate Now
              </button>
            </div>
          )}
        </div>
      )}

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
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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
                        {f.status === 'paid' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            disabled={!!downloadingReceipt[f.id]}
                            onClick={() => void handleDownloadReceipt(f)}
                            title="Download payment receipt"
                          >
                            {downloadingReceipt[f.id] ? '…' : '⬇ Receipt'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Fee dialog */}
      {showAddFeeDialog && (
        <div className="dialog-overlay" onClick={() => { setShowAddFeeDialog(false); resetAddFeeForm() }}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="dialog-title">Add Fee Record</div>

            {/* Student search */}
            <div className="form-group" style={{ marginBottom: 12 }} ref={searchRef}>
              <label>Student *</label>
              {addStudentId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 5, background: 'rgba(139,46,63,0.04)' }}>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{addStudentName}</span>
                  <button
                    type="button"
                    onClick={() => { setAddStudentId(''); setAddStudentName(''); setAddStudentSearch('') }}
                    style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ✕ Change
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Type student name to search…"
                    value={addStudentSearch}
                    onChange={(e) => { setAddStudentSearch(e.target.value); setShowDropdown(true) }}
                    onFocus={() => { if (addStudentSearch.length >= 2) setShowDropdown(true) }}
                    autoComplete="off"
                  />
                  {showDropdown && studentSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                      background: '#fff', border: '1px solid var(--border)', borderRadius: 5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: 2, overflow: 'hidden',
                    }}>
                      {studentSuggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onMouseDown={() => {
                            setAddStudentId(s.id)
                            setAddStudentName(s.full_name)
                            setAddStudentSearch(s.full_name)
                            setShowDropdown(false)
                          }}
                          style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            padding: '9px 12px', background: 'none', border: 'none',
                            cursor: 'pointer', borderBottom: '1px solid var(--border)',
                            fontSize: 13,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,46,63,0.05)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                        >
                          <span style={{ fontWeight: 600 }}>{s.full_name}</span>
                          <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{s.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {showDropdown && addStudentSearch.length >= 2 && studentSuggestions.length === 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#fff', border: '1px solid var(--border)', borderRadius: 5, padding: '10px 12px', fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                      No students found
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Fee Type *</label>
                <select value={addFeeType} onChange={(e) => setAddFeeType(e.target.value)}>
                  <option value="monthly">Monthly</option>
                  <option value="admission">Admission</option>
                  <option value="annual">Annual</option>
                  <option value="exam">Exam</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  min={1}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {addFeeType === 'monthly' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Month / Year *</label>
                  <input type="month" value={addMonthYear} onChange={(e) => setAddMonthYear(e.target.value)} />
                </div>
              )}
              <div className="form-group" style={{ marginBottom: 0, gridColumn: addFeeType === 'monthly' ? 'auto' : '1 / -1' }}>
                <label>Due Date *</label>
                <input type="date" value={addDueDate} onChange={(e) => setAddDueDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Notes (optional)</label>
              <input
                type="text"
                value={addNotes}
                onChange={(e) => setAddNotes(e.target.value)}
                placeholder="e.g. Admission fee for new student"
              />
            </div>

            <div className="dialog-actions">
              <button className="btn btn-ghost" onClick={() => { setShowAddFeeDialog(false); resetAddFeeForm() }}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => { void handleAddFee() }}
                disabled={createFee.isPending || !addStudentId || !addAmount}
              >
                {createFee.isPending ? 'Saving…' : 'Add Fee Record'}
              </button>
            </div>
          </div>
        </div>
      )}

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
