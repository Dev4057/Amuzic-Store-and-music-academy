'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useBatch, useMarkAttendance, useEnrollStudent, useUnenrollStudent } from '../../../../hooks/useBatches'
import { RoleGuard } from '../../../../components/RoleGuard'
import { ConfirmDialog } from '../../../../components/ConfirmDialog'
import { useToast } from '../../../../components/Toast'
import { formatDate } from '@amuzic/shared'

type Tab = 'students' | 'attendance'

interface Student {
  id: string
  full_name: string
  phone: string
}

interface Enrollment {
  id: string
  students: Student | null
}

interface AttendanceRecord {
  id: string
  student_id: string
  status: string
  notes?: string
  students: Student | null
}

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('students')
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]!)
  const [attMap, setAttMap] = useState<Record<string, string>>({})
  const [enrollId, setEnrollId] = useState('')

  const { data: batchData, isLoading, refetch } = useBatch(id)
  const markAttendance = useMarkAttendance(id)
  const enrollStudent = useEnrollStudent(id)
  const unenrollStudent = useUnenrollStudent(id)

  const batch = batchData?.data
  const course = batch?.course as { name: string; slug: string } | null
  const teacher = batch?.teacher as { full_name: string } | null
  const students = (batch?.students ?? []) as Enrollment[]

  function setStatus(studentId: string, status: string) {
    setAttMap((prev) => ({ ...prev, [studentId]: status }))
  }

  async function handleMarkAll(status: string) {
    const newMap: Record<string, string> = {}
    students.forEach((e) => {
      if (e.students) newMap[e.students.id] = status
    })
    setAttMap(newMap)
  }

  async function handleSubmitAttendance() {
    const attendance = Object.entries(attMap).map(([student_id, status]) => ({ student_id, status }))
    if (attendance.length === 0) {
      toast('Mark at least one student', 'error')
      return
    }
    try {
      await markAttendance.mutateAsync({ class_date: attDate, attendance })
      toast(`Attendance saved for ${formatDate(attDate)}`)
    } catch {
      toast('Failed to save attendance', 'error')
    }
  }

  if (isLoading) {
    return <div className="loading-center"><span className="spinner" /> Loading batch…</div>
  }
  if (!batch) {
    return (
      <div>
        <div className="alert alert-error">Batch not found</div>
        <button className="btn btn-ghost" onClick={() => router.back()}>← Back</button>
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Link href="/batches" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>← Batches</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>{batch.name}</h1>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              {course?.name} · {teacher?.full_name ?? 'Unassigned'} · {batch.schedule_days?.join(', ')} at {batch.schedule_time}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-gray">{batch.duration_minutes} min</span>
            <span className={`badge ${batch.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{batch.status}</span>
          </div>
        </div>
      </div>

      <div className="tabs">
        {[{ key: 'students' as Tab, label: `Students (${students.length})` }, { key: 'attendance' as Tab, label: 'Mark Attendance' }].map((t) => (
          <button key={t.key} className={`tab-item${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Students tab */}
      {tab === 'students' && (
        <div>
          <RoleGuard allowedRoles={['director', 'teacher']}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Student ID to enroll"
                value={enrollId}
                onChange={(e) => setEnrollId(e.target.value)}
                style={{ width: 240 }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  if (!enrollId) return
                  try {
                    await enrollStudent.mutateAsync(enrollId)
                    toast('Student enrolled')
                    setEnrollId('')
                    void refetch()
                  } catch {
                    toast('Failed to enroll student', 'error')
                  }
                }}
              >
                Enroll Student
              </button>
            </div>
          </RoleGuard>
          <div className="card">
            {students.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">◎</div>
                <div className="empty-state-title">No students enrolled</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Name</th><th>Phone</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {students.map((e) => e.students && (
                      <tr key={e.id}>
                        <td>
                          <Link href={`/students/${e.students.id}`} style={{ fontWeight: 600, color: 'var(--burgundy)', textDecoration: 'none' }}>
                            {e.students.full_name}
                          </Link>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--muted)' }}>{e.students.phone}</td>
                        <td>
                          <RoleGuard allowedRoles={['director']}>
                            <ConfirmDialog
                              title="Remove Student"
                              description={`Remove ${e.students.full_name} from this batch?`}
                              confirmLabel="Remove"
                              variant="danger"
                              onConfirm={async () => {
                                await unenrollStudent.mutateAsync(e.students!.id)
                                toast('Student removed')
                                void refetch()
                              }}
                              trigger={<button className="btn btn-danger btn-sm">Remove</button>}
                            />
                          </RoleGuard>
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

      {/* Attendance tab */}
      {tab === 'attendance' && (
        <div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Date</label>
              <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} style={{ width: 180 }} />
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 20 }} onClick={() => handleMarkAll('present')}>
              Mark All Present
            </button>
          </div>

          {students.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">✓</div>
                <div className="empty-state-title">No students to mark</div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Student</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {students.map((e) => e.students && (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 600 }}>{e.students.full_name}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {(['present', 'absent', 'late', 'cancelled'] as const).map((s) => (
                              <button
                                key={s}
                                className={`att-btn att-btn-${s}${attMap[e.students!.id] === s ? ' active' : ''}`}
                                onClick={() => setStatus(e.students!.id, s)}
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
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => { void handleSubmitAttendance() }}
                  disabled={markAttendance.isPending}
                >
                  {markAttendance.isPending ? 'Saving…' : `Save Attendance for ${formatDate(attDate)}`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
