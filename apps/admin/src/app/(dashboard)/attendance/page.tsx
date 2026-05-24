'use client'

import { useState } from 'react'
import { useBatches, useMarkAttendance } from '../../../hooks/useBatches'
import { useToast } from '../../../components/Toast'
import { PageHeader } from '../../../components/PageHeader'
import { formatDate } from '@amuzic/shared'
import type { Batch } from '@amuzic/shared'

interface Enrollment {
  id: string
  students: { id: string; full_name: string } | null
}

export default function AttendancePage() {
  const { toast } = useToast()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]!)
  const [attMaps, setAttMaps] = useState<Record<string, Record<string, string>>>({})
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const { data: batchesData, isLoading } = useBatches({ status: 'active' })
  const batches = batchesData?.batches ?? []

  const todayDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const todayBatches = batches.filter((b) => b.schedule_days?.includes(todayDay))

  function setStatus(batchId: string, studentId: string, status: string) {
    setAttMaps((prev) => ({
      ...prev,
      [batchId]: { ...(prev[batchId] ?? {}), [studentId]: status },
    }))
  }

  function markAll(batchId: string, status: string, enrollments: Enrollment[]) {
    const newMap: Record<string, string> = {}
    enrollments.forEach((e) => { if (e.students) newMap[e.students.id] = status })
    setAttMaps((prev) => ({ ...prev, [batchId]: newMap }))
  }

  const createMutation = (batchId: string) => {
    return useMarkAttendanceForBatch(batchId)
  }

  async function handleSave(batchId: string, mark: ReturnType<typeof useMarkAttendance>) {
    const map = attMaps[batchId] ?? {}
    const attendance = Object.entries(map).map(([student_id, status]) => ({ student_id, status }))
    if (attendance.length === 0) { toast('Mark at least one student', 'error'); return }
    setSaving((p) => ({ ...p, [batchId]: true }))
    try {
      await mark.mutateAsync({ class_date: date, attendance })
      toast(`Attendance saved for ${formatDate(date)}`)
    } catch {
      toast('Failed to save attendance', 'error')
    } finally {
      setSaving((p) => ({ ...p, [batchId]: false }))
    }
  }

  return (
    <>
      <PageHeader title="Attendance" description="Mark daily attendance for your batches" />

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: 200 }}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div style={{ marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
          {isLoading ? '…' : `${todayBatches.length} batch${todayBatches.length !== 1 ? 'es' : ''} scheduled`}
        </div>
      </div>

      {isLoading ? (
        <div className="loading-center"><span className="spinner" /> Loading…</div>
      ) : todayBatches.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✓</div>
            <div className="empty-state-title">No classes on this day</div>
            <p className="empty-state-body">No batches are scheduled for {formatDate(date)}</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {todayBatches.map((b) => (
            <AttendanceBatchCard
              key={b.id}
              batch={b}
              date={date}
              attMap={attMaps[b.id] ?? {}}
              isExpanded={expandedBatch === b.id}
              isSaving={saving[b.id] ?? false}
              onToggle={() => setExpandedBatch(expandedBatch === b.id ? null : b.id)}
              onSetStatus={(sid, status) => setStatus(b.id, sid, status)}
              onMarkAll={(status, enrollments) => markAll(b.id, status, enrollments)}
              onSave={async (mark) => handleSave(b.id, mark)}
            />
          ))}
        </div>
      )}
    </>
  )
}

function useMarkAttendanceForBatch(batchId: string) {
  return useMarkAttendance(batchId)
}

interface AttBatchCardProps {
  batch: Batch & { enrolled_count: number }
  date: string
  attMap: Record<string, string>
  isExpanded: boolean
  isSaving: boolean
  onToggle: () => void
  onSetStatus: (studentId: string, status: string) => void
  onMarkAll: (status: string, enrollments: Enrollment[]) => void
  onSave: (mark: ReturnType<typeof useMarkAttendance>) => Promise<void>
}

function AttendanceBatchCard({ batch, attMap, isExpanded, isSaving, onToggle, onSetStatus, onMarkAll, onSave }: AttBatchCardProps) {
  const mark = useMarkAttendance(batch.id)
  const enrollments: Enrollment[] = []

  return (
    <div className="card">
      <div
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onClick={onToggle}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{batch.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {batch.schedule_time} · {batch.enrolled_count} students
          </div>
        </div>
        <span style={{ color: 'var(--muted)' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '12px 20px', background: 'var(--cream)', display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onMarkAll('present', enrollments)}>All Present</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onMarkAll('absent', enrollments)}>All Absent</button>
          </div>
          {enrollments.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Open batch detail to mark attendance with student list
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Student</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => e.students && (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.students.full_name}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {(['present', 'absent', 'late', 'cancelled'] as const).map((s) => (
                            <button
                              key={s}
                              className={`att-btn att-btn-${s}${attMap[e.students!.id] === s ? ' active' : ''}`}
                              onClick={() => onSetStatus(e.students!.id, s)}
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { void onSave(mark) }}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
