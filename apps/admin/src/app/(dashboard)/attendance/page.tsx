'use client'

import { useState } from 'react'
import { useBatches, useBatch, useMarkAttendance, useBatchAttendance } from '../../../hooks/useBatches'
import { useTeachers, useTeacherAttendance, useMarkTeacherAttendance } from '../../../hooks/useTeachers'
import { useAuth } from '../../../hooks/useAuth'
import { useToast } from '../../../components/Toast'
import { PageHeader } from '../../../components/PageHeader'
import { formatDate } from '@amuzic/shared'
import type { Batch } from '@amuzic/shared'

interface Enrollment {
  id: string
  students: { id: string; full_name: string } | null
}

export default function AttendancePage() {
  const { user } = useAuth()
  const isDirector = user?.role === 'director'
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>(isDirector ? 'teachers' : 'students')

  return (
    <>
      <PageHeader title="Attendance" description="Manage and view attendance records" />

      {isDirector && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('teachers')}
            style={{
              background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer',
              fontWeight: 600, fontSize: 15,
              borderBottom: activeTab === 'teachers' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'teachers' ? 'var(--primary)' : 'var(--muted)'
            }}
          >
            Teacher Attendance
          </button>
          <button
            onClick={() => setActiveTab('students')}
            style={{
              background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer',
              fontWeight: 600, fontSize: 15,
              borderBottom: activeTab === 'students' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'students' ? 'var(--primary)' : 'var(--muted)'
            }}
          >
            Student Attendance
          </button>
        </div>
      )}

      {activeTab === 'teachers' && isDirector && <TeacherAttendanceView />}
      {activeTab === 'students' && <StudentAttendanceView readOnly={isDirector} />}
    </>
  )
}

function TeacherAttendanceView() {
  const { toast } = useToast()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]!)
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers()
  const { data: attendanceData, isLoading: isLoadingAtt } = useTeacherAttendance(date)
  const markMutation = useMarkTeacherAttendance()
  const [attMap, setAttMap] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const teachers = teachersData?.teachers || []

  // Derived status taking unsaved selection OR saved selection
  const getStatus = (teacherId: string) => {
    if (attMap[teacherId]) return attMap[teacherId]
    const existing = attendanceData?.find(a => a.teacher_id === teacherId)
    return existing ? existing.status : undefined
  }

  const setStatus = (teacherId: string, status: string) => {
    setAttMap(prev => ({ ...prev, [teacherId]: status }))
  }

  const handleSave = async () => {
    const records = Object.entries(attMap).map(([teacher_id, status]) => ({ teacher_id, status }))
    if (records.length === 0) {
      toast('Please make at least one change to save', 'error')
      return
    }
    setSaving(true)
    try {
      await markMutation.mutateAsync({ records, date })
      toast('Teacher attendance saved')
      setAttMap({}) // Clear local unsaved state so it falls back to newly fetched
    } catch {
      toast('Failed to save teacher attendance', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              setAttMap({})
            }}
            style={{ width: 200 }}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Teachers</h3>
        </div>
        
        {isLoadingTeachers || isLoadingAtt ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : teachers.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>No teachers found.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.full_name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {(['present', 'absent', 'half_day', 'on_leave'] as const).map(s => {
                          const currentStatus = getStatus(t.id) === s
                          return (
                            <button
                              key={s}
                              type="button"
                              className={`att-btn att-btn-` + (['half_day', 'on_leave'].includes(s) ? 'late' : s) + (currentStatus ? ' active' : '')}
                              onClick={() => setStatus(t.id, s)}
                            >
                              {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </button>
                          )
                        })}
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
            onClick={handleSave}
            disabled={saving || Object.keys(attMap).length === 0}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StudentAttendanceView({ readOnly }: { readOnly: boolean }) {
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
    if (readOnly) return
    setAttMaps((prev) => ({
      ...prev,
      [batchId]: { ...(prev[batchId] ?? {}), [studentId]: status },
    }))
  }

  function markAll(batchId: string, status: string, enrollments: Enrollment[]) {
    if (readOnly) return
    const newMap: Record<string, string> = {}
    enrollments.forEach((e) => { if (e.students) newMap[e.students.id] = status })
    setAttMaps((prev) => ({ ...prev, [batchId]: newMap }))
  }

  async function handleSave(batchId: string, mark: ReturnType<typeof useMarkAttendance>) {
    if (readOnly) return
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
    <div>
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
          {isLoading ? '...' : `${todayBatches.length} batch${todayBatches.length !== 1 ? 'es' : ''} scheduled`}
        </div>
      </div>

      {isLoading ? (
        <div className="loading-center"><span className="spinner" /> Loading...</div>
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
              readOnly={readOnly}
              onToggle={() => setExpandedBatch(expandedBatch === b.id ? null : b.id)}
              onSetStatus={(sid, status) => setStatus(b.id, sid, status)}
              onMarkAll={(status, enrollments) => markAll(b.id, status, enrollments)}
              onSave={async (mark) => handleSave(b.id, mark)}
            />
          ))}
        </div>
      )}
    </div>
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
  readOnly: boolean
  onToggle: () => void
  onSetStatus: (studentId: string, status: string) => void
  onMarkAll: (status: string, enrollments: Enrollment[]) => void
  onSave: (mark: ReturnType<typeof useMarkAttendance>) => Promise<void>
}

function AttendanceBatchCard({ batch, date, attMap, isExpanded, isSaving, readOnly, onToggle, onSetStatus, onMarkAll, onSave }: AttBatchCardProps) {
  const mark = useMarkAttendance(batch.id)
  
  const { data: batchDetail, isLoading: isBatchLoading } = useBatch(batch.id)
  const { data: attendanceData, isLoading: isAttLoading } = useBatchAttendance(batch.id, date)
  
  const enrollments = (batchDetail?.data?.students ?? []) as Enrollment[]

  const getStatus = (studentId: string) => {
    if (attMap[studentId]) return attMap[studentId]
    const existing = (attendanceData?.attendance ?? []).find((a: any) => a.student_id === studentId)
    return existing ? existing.status : undefined
  }

  return (
    <div className="card">
      <div
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onClick={onToggle}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{batch.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {batch.schedule_time} · {batch.enrolled_count} default students
          </div>
        </div>
        <span style={{ color: 'var(--muted)' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {!readOnly && (
            <div style={{ padding: '12px 20px', background: 'var(--cream)', display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => onMarkAll('present', enrollments)}>All Present</button>
              <button className="btn btn-ghost btn-sm" onClick={() => onMarkAll('absent', enrollments)}>All Absent</button>
            </div>
          )}
          {isBatchLoading || isAttLoading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>Loading students...</div>
          ) : enrollments.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              No students enrolled in this batch
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Student</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => {
                    if (!e.students) return null
                    const currentStatus = getStatus(e.students.id)
                    return (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 600 }}>{e.students.full_name}</td>
                        <td>
                          {readOnly ? (
                            <span style={{ 
                              display: 'inline-block', 
                              padding: '4px 8px', 
                              borderRadius: 4, 
                              textTransform: 'capitalize',
                              fontSize: 13,
                              background: currentStatus === 'present' ? 'var(--success-light)' : 
                                          currentStatus === 'absent' ? 'var(--error-light)' : 
                                          currentStatus ? 'var(--warning-light)' : 'var(--border)',
                              color: currentStatus === 'present' ? 'var(--success)' : 
                                     currentStatus === 'absent' ? 'var(--error)' : 
                                     currentStatus ? 'var(--warning-dark)' : 'var(--muted)',
                            }}>
                              {currentStatus || 'Not marked yet'}
                            </span>
                          ) : (
                            <div style={{ display: 'flex', gap: 6 }}>
                              {(['present', 'absent', 'late', 'cancelled'] as const).map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  className={`att-btn att-btn-${s}${currentStatus === s ? ' active' : ''}`}
                                  onClick={() => onSetStatus(e.students!.id, s)}
                                >
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!readOnly && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { void onSave(mark) }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
