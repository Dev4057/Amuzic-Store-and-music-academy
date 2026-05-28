'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  useStudent,
  useStudentAttendance,
  useStudentFees,
  useStudentProgress,
} from '../../../../hooks/useStudents'
import { useCreateProgressNote } from '../../../../hooks/useProgressNotes'
import { useRecordPayment, useCreateFee } from '../../../../hooks/useFees'
import { useEnrollStudent, useUnenrollStudent } from '../../../../hooks/useBatches'
import { RoleGuard } from '../../../../components/RoleGuard'
import { ConfirmDialog } from '../../../../components/ConfirmDialog'
import { useToast } from '../../../../components/Toast'
import { formatCurrency, formatDate } from '@amuzic/shared'
import type { FeeRecord, ProgressNote, AttendanceStatus } from '@amuzic/shared'
import { downloadPdf } from '../../../../lib/downloadPdf'

type Tab = 'overview' | 'batches' | 'attendance' | 'fees' | 'progress'

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'batches', label: 'Batches' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'fees', label: 'Fees' },
  { key: 'progress', label: 'Progress' },
]

const statusBadge: Record<string, string> = {
  pending: 'badge-amber', paid: 'badge-green', overdue: 'badge-red', waived: 'badge-gray',
}
const skillBadge: Record<string, string> = {
  beginner: 'badge-gray', elementary: 'badge-blue', intermediate: 'badge-amber', advanced: 'badge-purple',
}
const attBadge: Record<AttendanceStatus, string> = {
  present: 'badge-green', absent: 'badge-red', late: 'badge-amber', cancelled: 'badge-gray',
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('overview')
  const [showPayDialog, setShowPayDialog] = useState(false)
  const [payFeeId, setPayFeeId] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]!)
  const [payMode, setPayMode] = useState('cash')
  const [payNotes, setPayNotes] = useState('')
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteSkill, setNoteSkill] = useState('')
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]!)
  const [enrollStudentId, setEnrollStudentId] = useState('')
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null)
  const [showAddFeeForm, setShowAddFeeForm] = useState(false)
  const [feeType, setFeeType] = useState<string>('monthly')
  const [feeAmount, setFeeAmount] = useState('')
  const [feeMonthYear, setFeeMonthYear] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [feeDueDate, setFeeDueDate] = useState(() => {
    const d = new Date()
    d.setDate(10)
    return d.toISOString().split('T')[0]!
  })
  const [feeNotes, setFeeNotes] = useState('')

  const { data: studentData, isLoading } = useStudent(id)
  const { data: attendanceData } = useStudentAttendance(id)
  const { data: feesData, refetch: refetchFees } = useStudentFees(id)
  const { data: progressData, refetch: refetchProgress } = useStudentProgress(id)

  const createNote = useCreateProgressNote(id)
  const createFee = useCreateFee()
  const enrollMutation = useEnrollStudent(id)

  const student = studentData?.data
  const fees = (feesData?.fees ?? []) as FeeRecord[]
  const progressNotes = (progressData?.notes ?? []) as (ProgressNote & { teachers: { full_name: string } | null })[]
  const attendance = (attendanceData?.attendance ?? []) as Array<{ id: string; class_date: string; status: AttendanceStatus; batches: { name: string } | null }>
  const enrollments = (studentData?.data?.enrollments ?? []) as Array<{
    id: string
    status: string
    batches: {
      id: string; name: string; schedule_time: string; schedule_days: string[]
      courses: { name: string; slug: string } | null
      teachers: { full_name: string } | null
    } | null
  }>
  const unenrollMutation = useUnenrollStudent(enrollments[0]?.batches?.id ?? '')

  const payFee = useRecordPayment(payFeeId ?? '', id)

  const attSummary = attendanceData?.summary

  if (isLoading) {
    return <div className="loading-center"><span className="spinner" /> Loading student…</div>
  }
  if (!student) {
    return (
      <div>
        <div className="alert alert-error">Student not found</div>
        <button className="btn btn-ghost" onClick={() => router.back()}>← Back</button>
      </div>
    )
  }

  async function handleRecordPayment() {
    if (!payFeeId || !payAmount) return
    try {
      await payFee.mutateAsync({
        paid_amount: Number(payAmount),
        paid_date: payDate,
        payment_mode: payMode,
        notes: payNotes || undefined,
      })
      toast('Payment recorded')
      setShowPayDialog(false)
      void refetchFees()
    } catch {
      toast('Failed to record payment', 'error')
    }
  }

  async function handleAddFee() {
    if (!feeAmount || Number(feeAmount) <= 0) return
    try {
      await createFee.mutateAsync({
        student_id: id,
        fee_type: feeType as 'monthly' | 'admission' | 'annual' | 'exam' | 'other',
        amount: Number(feeAmount),
        due_date: feeDueDate,
        month_year: feeType === 'monthly' ? feeMonthYear : undefined,
        status: 'pending',
        notes: feeNotes || undefined,
      })
      toast('Fee record added')
      setFeeAmount('')
      setFeeNotes('')
      setShowAddFeeForm(false)
      void refetchFees()
    } catch {
      toast('Failed to add fee record', 'error')
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return
    try {
      await createNote.mutateAsync({
        note_text: noteText,
        student_id: id,
        skill_level: noteSkill || undefined,
        class_date: noteDate,
      })
      toast('Progress note added')
      setNoteText('')
      setNoteSkill('')
      setShowNoteForm(false)
      void refetchProgress()
    } catch {
      toast('Failed to add note', 'error')
    }
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/students" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>
          ← Students
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
          <div className="avatar avatar-lg">
            {student.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>{student.full_name}</h1>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
              {student.phone} {student.email ? `· ${student.email}` : ''}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`badge ${student.status === 'active' ? 'badge-green' : student.status === 'inactive' ? 'badge-red' : 'badge-amber'}`}>
              {student.status?.replace('_', ' ')}
            </span>
            <RoleGuard allowedRoles={['director']}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={pdfGenerating === 'report'}
                onClick={async () => {
                  const { StudentReportPdf } = await import('../../../../components/pdf/generators/StudentReportPdf')
                  const { createElement } = await import('react')
                  const attRows = Object.entries(
                    (attendanceData?.attendance ?? []).reduce<Record<string, { held: number; present: number; absent: number; late: number }>>((acc, a) => {
                      const rec = a as { class_date: string; status: string }
                      const m = new Date(rec.class_date).toLocaleString('en-IN', { month: 'short', year: 'numeric' })
                      if (!acc[m]) acc[m] = { held: 0, present: 0, absent: 0, late: 0 }
                      acc[m]!.held++
                      if (rec.status === 'present') acc[m]!.present++
                      else if (rec.status === 'absent') acc[m]!.absent++
                      else if (rec.status === 'late') { acc[m]!.present++; acc[m]!.late++ }
                      return acc
                    }, {})
                  ).map(([month, s]) => ({ month, ...s, rate: s.held > 0 ? Math.round((s.present / s.held) * 100) : 0 }))
                  const firstBatch = enrollments[0]?.batches
                  void downloadPdf(
                    createElement(StudentReportPdf, {
                      student: {
                        ...student,
                        course_name: firstBatch?.courses?.name,
                        batch_name: firstBatch?.name,
                        teacher_name: firstBatch?.teachers?.full_name,
                      },
                      attendanceSummary: attRows,
                      fees: fees as FeeRecord[],
                      progressNotes: progressNotes.map((n) => ({ ...n, teacher_name: n.teachers?.full_name ?? undefined })),
                      overallAttendanceRate: attSummary?.rate ?? 0,
                      feeSummary: {
                        total_billed: fees.reduce((s, f) => s + f.amount, 0),
                        total_paid: feesData?.summary?.total_paid ?? 0,
                        outstanding: feesData?.summary?.total_pending ?? 0,
                      },
                    }),
                    `student-report-${student.full_name.replace(/\s+/g, '-')}.pdf`,
                    () => setPdfGenerating('report'),
                    () => setPdfGenerating(null),
                    () => toast('Failed to generate report', 'error'),
                  )
                }}
              >
                {pdfGenerating === 'report' ? 'Generating…' : '↓ Report'}
              </button>
            </RoleGuard>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`tab-item${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="card" style={{ padding: 24 }}>
          <div className="info-grid">
            {[
              ['Student Type', student.student_type ?? '—'],
              ['Gender', student.gender ?? '—'],
              ['Date of Birth', student.date_of_birth ? formatDate(student.date_of_birth) : '—'],
              ['Enrollment Date', formatDate(student.enrollment_date)],
              ['Guardian', student.guardian_name ? `${student.guardian_name} (${student.guardian_phone ?? ''})` : '—'],
              ['Address', student.address ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="info-item">
                <label>{label}</label>
                <div className="info-item-value">{value}</div>
              </div>
            ))}
          </div>
          {student.notes && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <label>Notes</label>
              <div className="info-item-value" style={{ marginTop: 4 }}>{student.notes}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-value">{attSummary?.rate ?? 0}%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-value">{formatCurrency(feesData?.summary?.total_paid ?? 0)}</div>
              <div className="stat-label">Total Paid</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-value">{enrollments.length}</div>
              <div className="stat-label">Batches Enrolled</div>
            </div>
          </div>
        </div>
      )}

      {/* Batches */}
      {tab === 'batches' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <RoleGuard allowedRoles={['director', 'teacher']}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Batch ID to enroll"
                  value={enrollStudentId}
                  onChange={(e) => setEnrollStudentId(e.target.value)}
                  style={{ width: 200 }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (enrollStudentId) {
                      void enrollMutation.mutateAsync(enrollStudentId).then(() => {
                        toast('Student enrolled in batch')
                        setEnrollStudentId('')
                      }).catch(() => toast('Failed to enroll', 'error'))
                    }
                  }}
                >
                  Enroll
                </button>
              </div>
            </RoleGuard>
          </div>
          {enrollments.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">◈</div>
                <div className="empty-state-title">No active batches</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {enrollments.map((e) => (
                <div key={e.id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>
                        <Link href={`/batches/${e.batches?.id}`} style={{ color: 'var(--burgundy)', textDecoration: 'none' }}>
                          {e.batches?.name ?? '—'}
                        </Link>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {e.batches?.courses?.name} · {e.batches?.teachers?.full_name} · {e.batches?.schedule_days?.join(', ')} at {e.batches?.schedule_time}
                      </div>
                    </div>
                    <RoleGuard allowedRoles={['director']}>
                      <ConfirmDialog
                        title="Remove from Batch"
                        description="Remove this student from the batch?"
                        confirmLabel="Remove"
                        variant="danger"
                        onConfirm={async () => {
                          await unenrollMutation.mutateAsync(id)
                          toast('Student removed from batch')
                        }}
                        trigger={<button className="btn btn-danger btn-sm">Remove</button>}
                      />
                    </RoleGuard>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attendance */}
      {tab === 'attendance' && (
        <div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            {[
              { label: 'Total', value: attSummary?.total ?? 0 },
              { label: 'Present/Late', value: attSummary?.present ?? 0 },
              { label: 'Attendance Rate', value: `${attSummary?.rate ?? 0}%` },
            ].map((s) => (
              <div key={s.label} className="stat-card" style={{ flex: 1 }}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card">
            {attendance.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✓</div>
                <div className="empty-state-title">No attendance records</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Batch</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {attendance.map((a) => (
                      <tr key={a.id}>
                        <td>{formatDate(a.class_date)}</td>
                        <td>{a.batches?.name ?? '—'}</td>
                        <td><span className={`badge ${attBadge[a.status] ?? 'badge-gray'}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fees */}
      {tab === 'fees' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 20 }}>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-value">{formatCurrency(feesData?.summary?.total_paid ?? 0)}</div>
              <div className="stat-label">Total Paid</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-value" style={{ color: '#DC2626' }}>{formatCurrency(feesData?.summary?.total_pending ?? 0)}</div>
              <div className="stat-label">Pending</div>
            </div>
            <RoleGuard allowedRoles={['director']}>
              <button className="btn btn-primary" style={{ marginTop: 4 }} onClick={() => setShowAddFeeForm(!showAddFeeForm)}>
                + Add Fee
              </button>
            </RoleGuard>
          </div>

          {showAddFeeForm && (
            <div className="form-section" style={{ marginBottom: 20 }}>
              <div className="form-section-title">New Fee Record</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Fee Type *</label>
                  <select value={feeType} onChange={(e) => setFeeType(e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="admission">Admission</option>
                    <option value="annual">Annual</option>
                    <option value="exam">Exam</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    min={1}
                  />
                </div>
                {feeType === 'monthly' && (
                  <div className="form-group">
                    <label>Month / Year *</label>
                    <input
                      type="month"
                      value={feeMonthYear}
                      onChange={(e) => setFeeMonthYear(e.target.value)}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Due Date *</label>
                  <input
                    type="date"
                    value={feeDueDate}
                    onChange={(e) => setFeeDueDate(e.target.value)}
                  />
                </div>
                <div className="form-group full">
                  <label>Notes (optional)</label>
                  <input
                    type="text"
                    value={feeNotes}
                    onChange={(e) => setFeeNotes(e.target.value)}
                    placeholder="e.g. Revised fee for summer term"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-ghost" onClick={() => setShowAddFeeForm(false)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={() => { void handleAddFee() }}
                  disabled={createFee.isPending || !feeAmount}
                >
                  {createFee.isPending ? 'Saving…' : 'Add Fee Record'}
                </button>
              </div>
            </div>
          )}

          <div className="card">
            {fees.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">₹</div>
                <div className="empty-state-title">No fee records</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Month</th><th>Type</th><th>Amount</th><th>Due</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {fees.map((f) => (
                      <tr key={f.id}>
                        <td>{f.month_year ?? '—'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{f.fee_type}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(f.amount)}</td>
                        <td style={{ fontSize: 13 }}>{formatDate(f.due_date)}</td>
                        <td><span className={`badge ${statusBadge[f.status] ?? 'badge-gray'}`}>{f.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {(f.status === 'pending' || f.status === 'overdue') && (
                              <RoleGuard allowedRoles={['director']}>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => {
                                    setPayFeeId(f.id)
                                    setPayAmount(String(f.amount))
                                    setShowPayDialog(true)
                                  }}
                                >
                                  Record Payment
                                </button>
                              </RoleGuard>
                            )}
                            {f.status === 'paid' && (
                              <button
                                className="btn btn-ghost btn-sm"
                                disabled={pdfGenerating === f.id}
                                onClick={async () => {
                                  const { FeeReceiptPdf } = await import('../../../../components/pdf/generators/FeeReceiptPdf')
                                  const { createElement } = await import('react')
                                  const firstBatch = enrollments[0]?.batches
                                  void downloadPdf(
                                    createElement(FeeReceiptPdf, {
                                      student: {
                                        ...student,
                                        course_name: firstBatch?.courses?.name,
                                        batch_name: firstBatch?.name,
                                      },
                                      fee: f as FeeRecord,
                                    }),
                                    `receipt-${student.full_name.replace(/\s+/g, '-')}-${f.month_year ?? f.id.slice(0, 8)}.pdf`,
                                    () => setPdfGenerating(f.id),
                                    () => setPdfGenerating(null),
                                    () => toast('Failed to generate receipt', 'error'),
                                  )
                                }}
                              >
                                {pdfGenerating === f.id ? '…' : '↓ Receipt'}
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
        </div>
      )}

      {/* Progress */}
      {tab === 'progress' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <RoleGuard allowedRoles={['director', 'teacher']}>
              <button className="btn btn-primary" onClick={() => setShowNoteForm(!showNoteForm)}>
                + Add Note
              </button>
            </RoleGuard>
          </div>

          {showNoteForm && (
            <div className="form-section" style={{ marginBottom: 20 }}>
              <div className="form-section-title">New Progress Note</div>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Note *</label>
                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Student's progress, areas of improvement…"
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="form-group">
                  <label>Skill Level</label>
                  <select value={noteSkill} onChange={(e) => setNoteSkill(e.target.value)}>
                    <option value="">Not specified</option>
                    <option value="beginner">Beginner</option>
                    <option value="elementary">Elementary</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Class Date</label>
                  <input type="date" value={noteDate} onChange={(e) => setNoteDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-ghost" onClick={() => setShowNoteForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => { void handleAddNote() }} disabled={createNote.isPending}>
                  {createNote.isPending ? 'Saving…' : 'Save Note'}
                </button>
              </div>
            </div>
          )}

          {progressNotes.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">○</div>
                <div className="empty-state-title">No progress notes yet</div>
                <p className="empty-state-body">Teachers can add notes after each class</p>
              </div>
            </div>
          ) : (
            progressNotes.map((n) => (
              <div key={n.id} className="note-card">
                <div className="note-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {n.skill_level && (
                      <span className={`badge ${skillBadge[n.skill_level] ?? 'badge-gray'}`}>{n.skill_level}</span>
                    )}
                    <span className="note-card-meta">{n.teachers?.full_name ?? 'Director'}</span>
                  </div>
                  <span className="note-card-meta">{formatDate(n.class_date)}</span>
                </div>
                <div className="note-card-body">{n.note_text}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Record Payment Dialog */}
      {showPayDialog && (
        <div className="dialog-overlay" onClick={() => setShowPayDialog(false)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">Record Payment</div>
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
              <input type="text" value={payNotes} onChange={(e) => setPayNotes(e.target.value)} placeholder="e.g. Paid in two installments" />
            </div>
            <div className="dialog-actions">
              <button className="btn btn-ghost" onClick={() => setShowPayDialog(false)}>Cancel</button>
              <button className="btn btn-success" onClick={() => { void handleRecordPayment() }} disabled={payFee.isPending}>
                {payFee.isPending ? 'Saving…' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
