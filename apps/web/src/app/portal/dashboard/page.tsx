'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  )
}

interface StudentRecord {
  id: string
  full_name: string
  status: string
  enrollment_date: string
  batch_enrollments?: Array<{
    batches: {
      name: string
      schedule_time: string
      schedule_days: string[]
      courses: { name: string } | null
      teachers: { full_name: string } | null
    } | null
  }>
}

interface AttendanceSummary {
  total: number
  present: number
  rate: number
}

interface FeeInfo {
  amount: number
  due_date: string
  month_year: string | null
  status: string
}

interface ProgressNote {
  note_text: string
  skill_level: string | null
  class_date: string
  teachers: { full_name: string } | null
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export default function PortalDashboardPage() {
  const [student, setStudent] = useState<StudentRecord | null>(null)
  const [attendance, setAttendance] = useState<AttendanceSummary>({ total: 0, present: 0, rate: 0 })
  const [nextFee, setNextFee] = useState<FeeInfo | null>(null)
  const [outstanding, setOutstanding] = useState(0)
  const [latestNote, setLatestNote] = useState<ProgressNote | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()

    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Student record
      const { data: studentData } = await supabase
        .from('students')
        .select(`
          id, full_name, status, enrollment_date,
          batch_enrollments(
            batches(name, schedule_time, schedule_days, courses(name), teachers(full_name))
          )
        `)
        .eq('profile_id', session.user.id)
        .eq('batch_enrollments.status', 'active')
        .single()

      if (!studentData) { setLoading(false); return }
      setStudent(studentData as unknown as StudentRecord)

      // Attendance (last 3 months)
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      const { data: attData } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', studentData.id)
        .gte('class_date', threeMonthsAgo.toISOString().split('T')[0]!)

      const total = attData?.length ?? 0
      const present = attData?.filter((a) => a.status === 'present' || a.status === 'late').length ?? 0
      setAttendance({ total, present, rate: total > 0 ? Math.round((present / total) * 100) : 0 })

      // Fees
      const { data: feeData } = await supabase
        .from('fee_records')
        .select('amount, due_date, month_year, status')
        .eq('student_id', studentData.id)
        .in('status', ['pending', 'overdue'])
        .order('due_date', { ascending: true })

      const out = (feeData ?? []).reduce((s, f) => s + f.amount, 0)
      setOutstanding(out)
      setNextFee(feeData?.[0] ?? null)

      // Latest progress note
      const { data: noteData } = await supabase
        .from('progress_notes')
        .select('note_text, skill_level, class_date, teachers(full_name)')
        .eq('student_id', studentData.id)
        .order('class_date', { ascending: false })
        .limit(1)
        .single()

      setLatestNote(noteData as ProgressNote | null)
      setLoading(false)
    }

    void load()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <span style={{ width: 28, height: 28, border: '2px solid #8B2E3F', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!student) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <p style={{ color: 'rgba(44,24,16,0.5)', fontSize: 14 }}>No student record linked to your account. Please contact the academy.</p>
      </div>
    )
  }

  const firstBatch = (student.batch_enrollments ?? [])[0]?.batches

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 400, color: '#2C1810', marginBottom: 4 }}>
          Welcome back, <em style={{ color: '#8B2E3F' }}>{student.full_name.split(' ')[0]}</em>! ♪
        </h1>
        {firstBatch && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {firstBatch.courses && (
              <span style={{ fontSize: 12, background: 'rgba(139,46,63,0.08)', color: '#8B2E3F', padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(139,46,63,0.15)', textTransform: 'capitalize' }}>
                {firstBatch.courses.name}
              </span>
            )}
            <span style={{ fontSize: 12, color: 'rgba(44,24,16,0.4)' }}>
              {firstBatch.name} · {firstBatch.schedule_days?.join(', ')} at {firstBatch.schedule_time}
            </span>
            {firstBatch.teachers && (
              <span style={{ fontSize: 12, color: 'rgba(44,24,16,0.4)' }}>· {firstBatch.teachers.full_name}</span>
            )}
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Attendance */}
        <div style={{ background: '#fff', border: '1px solid rgba(44,24,16,0.08)', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 11, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Attendance (3 months)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: attendance.rate >= 75 ? '#16A34A' : '#DC2626', marginBottom: 4 }}>
            {attendance.rate}%
          </div>
          <div style={{ fontSize: 12, color: 'rgba(44,24,16,0.4)' }}>{attendance.present} present of {attendance.total} classes</div>
          <div style={{ background: 'rgba(44,24,16,0.05)', borderRadius: 4, height: 6, marginTop: 12 }}>
            <div style={{ background: attendance.rate >= 75 ? '#16A34A' : '#DC2626', borderRadius: 4, height: 6, width: `${attendance.rate}%`, transition: 'width 0.5s' }} />
          </div>
          <Link href="/portal/dashboard/attendance" style={{ fontSize: 12, color: '#8B2E3F', textDecoration: 'none', display: 'inline-block', marginTop: 12 }}>
            View details →
          </Link>
        </div>

        {/* Fee Status */}
        <div style={{ background: '#fff', border: '1px solid rgba(44,24,16,0.08)', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 11, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Fee Status</div>
          {nextFee ? (
            <>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>{formatCurrency(outstanding)}</div>
              <div style={{ fontSize: 12, color: 'rgba(44,24,16,0.4)' }}>
                Next: {formatCurrency(nextFee.amount)} due {new Date(nextFee.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#16A34A', marginBottom: 4 }}>All clear ✓</div>
              <div style={{ fontSize: 12, color: 'rgba(44,24,16,0.4)' }}>No pending fees</div>
            </>
          )}
          <Link href="/portal/dashboard/fees" style={{ fontSize: 12, color: '#8B2E3F', textDecoration: 'none', display: 'inline-block', marginTop: 12 }}>
            View fees →
          </Link>
        </div>

        {/* Latest Progress */}
        <div style={{ background: '#fff', border: '1px solid rgba(44,24,16,0.08)', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 11, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Latest Progress</div>
          {latestNote ? (
            <>
              {latestNote.skill_level && (
                <span style={{ fontSize: 11, background: 'rgba(201,160,64,0.12)', color: '#8B6914', padding: '2px 8px', borderRadius: 10, textTransform: 'capitalize', marginBottom: 8, display: 'inline-block' }}>
                  {latestNote.skill_level}
                </span>
              )}
              <p style={{ fontSize: 13, color: 'rgba(44,24,16,0.65)', lineHeight: 1.5, marginTop: 6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {latestNote.note_text}
              </p>
              <div style={{ fontSize: 11, color: 'rgba(44,24,16,0.3)', marginTop: 8 }}>
                {latestNote.teachers?.full_name} · {new Date(latestNote.class_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'rgba(44,24,16,0.35)' }}>No progress notes yet.</p>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/portal/dashboard/attendance" style={{ padding: '10px 20px', background: '#8B2E3F', color: '#FAF8F2', borderRadius: 5, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          View Attendance
        </Link>
        <Link href="/portal/dashboard/fees" style={{ padding: '10px 20px', background: 'rgba(44,24,16,0.06)', color: '#2C1810', borderRadius: 5, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          View Fees
        </Link>
      </div>
    </div>
  )
}
