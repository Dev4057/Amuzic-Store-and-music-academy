'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  )
}

interface AttendanceRecord {
  class_date: string
  status: 'present' | 'absent' | 'late' | 'cancelled'
}

const STATUS_COLORS: Record<string, { bg: string; label: string }> = {
  present:   { bg: '#16A34A', label: 'Present' },
  late:      { bg: '#D97706', label: 'Late' },
  absent:    { bg: '#DC2626', label: 'Absent' },
  cancelled: { bg: 'rgba(44,24,16,0.18)', label: 'Cancelled' },
}

function getMonthRange(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)
  return { first, last }
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function AttendancePage() {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [studentId, setStudentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch student ID once
  useEffect(() => {
    const supabase = getSupabase()
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', session.user.id)
        .single()
      if (data) setStudentId(data.id as string)
    })
  }, [])

  // Fetch attendance for selected month
  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    const supabase = getSupabase()
    const { first, last } = getMonthRange(year, month)
    void supabase
      .from('attendance')
      .select('class_date, status')
      .eq('student_id', studentId)
      .gte('class_date', first.toISOString().split('T')[0]!)
      .lte('class_date', last.toISOString().split('T')[0]!)
      .then(({ data }) => {
        setRecords((data ?? []) as AttendanceRecord[])
        setLoading(false)
      })
  }, [studentId, year, month])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
    if (isCurrentMonth) return
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  // Build lookup: "YYYY-MM-DD" -> status
  const byDate = Object.fromEntries(records.map(r => [r.class_date, r.status]))

  // Calendar grid
  const totalDays  = daysInMonth(year, month)
  const firstDow   = new Date(year, month, 1).getDay() // 0=Sun
  const calCells: Array<{ day: number | null; status?: string }> = []
  for (let i = 0; i < firstDow; i++) calCells.push({ day: null })
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    calCells.push({ day: d, status: byDate[dateStr] })
  }

  // Stats
  const total     = records.length
  const present   = records.filter(r => r.status === 'present' || r.status === 'late').length
  const absent    = records.filter(r => r.status === 'absent').length
  const rate      = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, color: '#2C1810', marginBottom: 24 }}>
        Attendance
      </h1>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button onClick={prevMonth} style={{ width: 32, height: 32, border: '1px solid rgba(44,24,16,0.15)', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 14, color: '#2C1810' }}>‹</button>
        <span style={{ fontWeight: 600, fontSize: 15, color: '#2C1810', minWidth: 150, textAlign: 'center' }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          style={{ width: 32, height: 32, border: '1px solid rgba(44,24,16,0.15)', borderRadius: 5, background: '#fff', cursor: isCurrentMonth ? 'default' : 'pointer', fontSize: 14, color: isCurrentMonth ? 'rgba(44,24,16,0.25)' : '#2C1810' }}
        >›</button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Classes', value: total },
          { label: 'Present', value: present, color: '#16A34A' },
          { label: 'Absent', value: absent, color: '#DC2626' },
          { label: 'Rate', value: `${rate}%`, color: rate >= 75 ? '#16A34A' : '#DC2626' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid rgba(44,24,16,0.08)', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color ?? '#2C1810' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div style={{ background: '#fff', border: '1px solid rgba(44,24,16,0.08)', borderRadius: 8, padding: 20 }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {DAY_LABELS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'rgba(44,24,16,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <span style={{ width: 24, height: 24, border: '2px solid #8B2E3F', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {calCells.map((cell, i) => {
              if (!cell.day) return <div key={i} />
              const sc = cell.status ? STATUS_COLORS[cell.status] : null
              const isToday = year === today.getFullYear() && month === today.getMonth() && cell.day === today.getDate()
              return (
                <div
                  key={i}
                  title={sc?.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '6px 2px',
                    borderRadius: 6,
                    background: isToday ? 'rgba(139,46,63,0.05)' : 'transparent',
                    border: isToday ? '1px solid rgba(139,46,63,0.2)' : '1px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 12, color: isToday ? '#8B2E3F' : 'rgba(44,24,16,0.5)', fontWeight: isToday ? 700 : 400, marginBottom: 4 }}>{cell.day}</span>
                  {sc ? (
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: sc.bg, display: 'inline-block' }} />
                  ) : (
                    <span style={{ width: 10, height: 10 }} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLORS).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(44,24,16,0.5)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: v.bg, display: 'inline-block' }} />
            {v.label}
          </div>
        ))}
      </div>
    </div>
  )
}
