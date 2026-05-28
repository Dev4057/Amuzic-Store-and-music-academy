'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  )
}

interface FeeRow {
  id: string
  fee_type: string
  amount: number
  due_date: string
  paid_date: string | null
  paid_amount: number | null
  payment_mode: string | null
  status: 'pending' | 'paid' | 'overdue' | 'waived'
  month_year: string | null
}

interface StudentInfo {
  id: string
  full_name: string
  phone: string
  batch_name?: string
  course_name?: string
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  paid:    { bg: 'rgba(22,163,74,0.1)',   color: '#16A34A', label: 'Paid' },
  pending: { bg: 'rgba(217,119,6,0.1)',   color: '#D97706', label: 'Pending' },
  overdue: { bg: 'rgba(220,38,38,0.1)',   color: '#DC2626', label: 'Overdue' },
  waived:  { bg: 'rgba(44,24,16,0.07)',   color: 'rgba(44,24,16,0.45)', label: 'Waived' },
}

export default function FeesPage() {
  const [fees, setFees] = useState<FeeRow[]>([])
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabase()
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: studentData } = await supabase
        .from('students')
        .select(`
          id, full_name, phone,
          batch_enrollments(
            batches(name, courses(name))
          )
        `)
        .eq('profile_id', session.user.id)
        .eq('batch_enrollments.status', 'active')
        .single()

      if (!studentData) { setLoading(false); return }

      const firstBatch = (studentData as any).batch_enrollments?.[0]?.batches
      setStudent({
        id: studentData.id as string,
        full_name: studentData.full_name as string,
        phone: studentData.phone as string,
        batch_name: firstBatch?.name,
        course_name: firstBatch?.courses?.name,
      })

      const { data: feeData } = await supabase
        .from('fee_records')
        .select('id, fee_type, amount, due_date, paid_date, paid_amount, payment_mode, status, month_year')
        .eq('student_id', studentData.id as string)
        .order('due_date', { ascending: false })

      setFees((feeData ?? []) as FeeRow[])
      setLoading(false)
    })()
  }, [])

  async function downloadReceipt(fee: FeeRow) {
    if (!student) return
    setPdfLoading(fee.id)
    try {
      const [{ pdf }, { saveAs }, { PortalFeeReceiptPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('file-saver'),
        import('./PortalFeeReceiptPdf'),
      ])
      const element = PortalFeeReceiptPdf({ student, fee })
      const blob = await pdf(element).toBlob()
      saveAs(blob, `receipt-${fee.id.slice(0, 8)}.pdf`)
    } catch (e) {
      console.error(e)
      alert('Could not generate receipt. Please try again.')
    } finally {
      setPdfLoading(null)
    }
  }

  const outstanding = fees.filter(f => f.status === 'pending' || f.status === 'overdue').reduce((s, f) => s + f.amount, 0)
  const totalPaid   = fees.filter(f => f.status === 'paid').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0)
  const hasOverdue  = fees.some(f => f.status === 'overdue')

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <span style={{ width: 28, height: 28, border: '2px solid #8B2E3F', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, color: '#2C1810', marginBottom: 24 }}>
        Fees
      </h1>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid rgba(44,24,16,0.08)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Outstanding</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: outstanding > 0 ? '#DC2626' : '#16A34A' }}>
            {outstanding > 0 ? formatCurrency(outstanding) : 'All clear ✓'}
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid rgba(44,24,16,0.08)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Total Paid</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#2C1810' }}>{formatCurrency(totalPaid)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid rgba(44,24,16,0.08)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Total Records</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#2C1810' }}>{fees.length}</div>
        </div>
      </div>

      {/* Overdue notice */}
      {hasOverdue && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '14px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600, color: '#991B1B', fontSize: 13 }}>You have overdue fees</div>
            <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 2 }}>Please contact the academy to avoid any disruption to your classes.</div>
          </div>
          <a href="tel:+918975916381" style={{ padding: '8px 16px', background: '#DC2626', color: '#fff', borderRadius: 5, textDecoration: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
            Call Now
          </a>
        </div>
      )}

      {/* Fee table */}
      {fees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(44,24,16,0.35)', fontSize: 14 }}>No fee records found.</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid rgba(44,24,16,0.08)', borderRadius: 8, overflow: 'hidden' }}>
          {/* Desktop table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 90px', gap: 0, background: 'rgba(44,24,16,0.04)', borderBottom: '1px solid rgba(44,24,16,0.08)', padding: '10px 16px' }} className="fee-header">
            {['Month / Type', 'Amount', 'Due Date', 'Status', 'Paid Date', 'Mode', ''].map(h => (
              <div key={h} style={{ fontSize: 11, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{h}</div>
            ))}
          </div>

          {fees.map((fee, i) => {
            const ss = STATUS_STYLE[fee.status] ?? STATUS_STYLE['pending']!
            return (
              <div
                key={fee.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 90px',
                  gap: 0,
                  padding: '12px 16px',
                  borderBottom: i < fees.length - 1 ? '1px solid rgba(44,24,16,0.06)' : 'none',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2C1810', textTransform: 'capitalize' }}>{fee.month_year ?? fee.fee_type}</div>
                  {fee.month_year && <div style={{ fontSize: 11, color: 'rgba(44,24,16,0.4)', textTransform: 'capitalize', marginTop: 2 }}>{fee.fee_type}</div>}
                </div>
                <div style={{ fontSize: 13, color: '#2C1810' }}>{formatCurrency(fee.amount)}</div>
                <div style={{ fontSize: 13, color: 'rgba(44,24,16,0.6)' }}>{formatDate(fee.due_date)}</div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, background: ss.bg, color: ss.color, padding: '3px 8px', borderRadius: 10 }}>{ss.label}</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(44,24,16,0.6)' }}>{fee.paid_date ? formatDate(fee.paid_date) : '—'}</div>
                <div style={{ fontSize: 13, color: 'rgba(44,24,16,0.6)', textTransform: 'capitalize' }}>
                  {fee.payment_mode ? fee.payment_mode.replace('_', ' ') : '—'}
                </div>
                <div>
                  {fee.status === 'paid' && (
                    <button
                      onClick={() => { void downloadReceipt(fee) }}
                      disabled={pdfLoading === fee.id}
                      style={{
                        fontSize: 11, fontWeight: 600, color: '#8B2E3F', background: 'rgba(139,46,63,0.08)',
                        border: '1px solid rgba(139,46,63,0.2)', borderRadius: 4, padding: '4px 10px',
                        cursor: pdfLoading === fee.id ? 'wait' : 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      {pdfLoading === fee.id ? '…' : '↓ Receipt'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p style={{ fontSize: 12, color: 'rgba(44,24,16,0.35)', marginTop: 20, textAlign: 'center' }}>
        Questions about your fees?{' '}
        <a href="tel:+918975916381" style={{ color: '#8B2E3F', textDecoration: 'none' }}>Call us at +91 89759 16381</a>
      </p>
    </div>
  )
}
