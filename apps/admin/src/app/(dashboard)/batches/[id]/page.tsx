'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useBatch, useMarkAttendance, useEnrollStudent, useUnenrollStudent, useBatchAttendance } from '../../../../hooks/useBatches'
import { useStudents } from '../../../../hooks/useStudents'
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
  const { data: allStudentsData } = useStudents({ status: 'active' })

  const { data: attendanceData, isLoading: isAttLoading } = useBatchAttendance(id, attDate)

  const batch = batchData?.data
  const course = batch?.course as { name: string; slug: string } | null
  const teacher = batch?.teacher as { full_name: string } | null
  const students = (batch?.students ?? []) as Enrollment[]

  function setStatus(studentId: string, status: string) {
    setAttMap((prev) => ({ ...prev, [studentId]: status }))
  }

  const getStatus = (studentId: string) => {
    if (attMap[studentId]) return attMap[studentId]
    const existing = (attendanceData?.attendance ?? []).find((a: any) => a.student_id === studentId)
    return existing ? existing.status : undefined
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 className="page-title" style={{ margin: 0 }}>{batch.name}</h1>
              {course && (
                <span className="badge badge-blue" style={{ fontSize: 12 }}>
                  {course.name}
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
              <strong>Teacher:</strong> {teacher?.full_name ?? 'Unassigned'} &nbsp;·&nbsp;
              {batch.schedule_days?.join(', ')} at {batch.schedule_time}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
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
          <RoleGuard allowedRoles={['director']}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <select
                value={enrollId}
                onChange={(e) => setEnrollId(e.target.value)}
                style={{ width: 260 }}
              >
                <option value="">— Select a student —</option>
                {(allStudentsData?.students ?? [])
                  .filter((s) => !students.some((e) => e.students?.id === s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name} — {s.phone}</option>
                  ))}
              </select>
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
              <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} style={{ width: 180 }} max={new Date().toISOString().split('T')[0]} />
            </div>
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => handleMarkAll('present')}>All Present</button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleMarkAll('absent')}>All Absent</button>
            </div>
          </div>

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
                            type="button"
                            className={`att-btn att-btn-${s}${getStatus(e.students!.id) === s ? ' active' : ''}`}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleSubmitAttendance}>Save Attendance</button>
          </div>
        </div>
      )}
    </>
  )
}
