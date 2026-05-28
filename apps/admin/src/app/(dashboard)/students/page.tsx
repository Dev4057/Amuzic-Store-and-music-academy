'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '../../../hooks/useStudents'
import { useBatches, useEnrollStudent } from '../../../hooks/useBatches'
import { RoleGuard } from '../../../components/RoleGuard'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { EmptyState } from '../../../components/EmptyState'
import { PageHeader } from '../../../components/PageHeader'
import { useToast } from '../../../components/Toast'
import { formatDate, getStudentType } from '@amuzic/shared'
import type { Student, StudentStatus, StudentType } from '@amuzic/shared'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateStudentSchema, type CreateStudentInput } from '@amuzic/shared'

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Completed', value: 'completed' },
]

const statusBadge: Record<StudentStatus, string> = {
  active: 'badge-green',
  inactive: 'badge-red',
  on_hold: 'badge-amber',
  completed: 'badge-gray',
}

const typeEmoji: Record<StudentType, string> = {
  child: '👧',
  adult: '👤',
  senior: '👴',
}

function useDebounce<T>(value: T, delay: number): T {
  const [dv, setDv] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return dv
}

interface StudentSheetProps {
  student?: Student
  onClose: () => void
  onSaved: () => void
}

function StudentSheet({ student, onClose, onSaved }: StudentSheetProps) {
  const { toast } = useToast()
  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent(student?.id ?? '')
  const [sendInvite, setSendInvite] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const { data: batchesData } = useBatches({ status: 'active' })
  const enrollInBatch = useEnrollStudent(selectedBatchId)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateStudentInput>({
    resolver: zodResolver(CreateStudentSchema),
    defaultValues: student
      ? {
          full_name: student.full_name,
          phone: student.phone,
          email: student.email ?? '',
          date_of_birth: student.date_of_birth ?? '',
          gender: student.gender as 'male' | 'female' | 'other' | undefined,
          address: student.address ?? '',
          guardian_name: student.guardian_name ?? '',
          guardian_phone: student.guardian_phone ?? '',
          student_type: student.student_type ?? 'adult',
          notes: student.notes ?? '',
        }
      : { student_type: 'adult' },
  })

  const dob = watch('date_of_birth')
  const studentType = watch('student_type')

  useEffect(() => {
    if (dob) {
      const st = getStudentType(dob)
      setValue('student_type', st)
    }
  }, [dob, setValue])

  async function onSubmit(data: CreateStudentInput) {
    try {
      if (student) {
        await updateStudent.mutateAsync(data)
        if (selectedBatchId) {
          await enrollInBatch.mutateAsync(student.id)
        }
        toast('Student updated successfully')
      } else {
        const result = await createStudent.mutateAsync({
          ...data,
          ...(sendInvite && data.email ? { send_portal_invite: true } : {}),
          ...(selectedBatchId ? { batch_id: selectedBatchId } : {}),
        })
        const inviteSent = (result as { invite_sent?: boolean }).invite_sent
        toast(inviteSent ? 'Student added — invite email sent!' : 'Student added successfully')
      }
      onSaved()
      onClose()
    } catch {
      toast(student ? 'Failed to update student' : 'Failed to add student', 'error')
    }
  }

  const isSaving = createStudent.isPending || updateStudent.isPending || enrollInBatch.isPending

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-panel">
        <div className="sheet-header">
          <h2 className="sheet-title">{student ? 'Edit Student' : 'Add Student'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={(e) => { void handleSubmit(onSubmit)(e) }} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="sheet-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" {...register('full_name')} placeholder="Ravi Sharma" />
                {errors.full_name && <div className="field-error">{errors.full_name.message}</div>}
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input type="text" {...register('phone')} placeholder="9876543210" />
                {errors.phone && <div className="field-error">10-digit Indian number required</div>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" {...register('email')} placeholder="ravi@email.com" />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" {...register('date_of_birth')} />
                {dob && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  Auto-detected: <strong>{studentType}</strong>
                </div>}
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select {...register('gender')}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Student Type *</label>
                <select {...register('student_type')}>
                  <option value="child">Child (&lt;18)</option>
                  <option value="adult">Adult (18–59)</option>
                  <option value="senior">Senior (60+)</option>
                </select>
              </div>
              {studentType === 'child' && (
                <>
                  <div className="form-group">
                    <label>Guardian Name</label>
                    <input type="text" {...register('guardian_name')} placeholder="Parent/Guardian name" />
                  </div>
                  <div className="form-group">
                    <label>Guardian Phone</label>
                    <input type="text" {...register('guardian_phone')} placeholder="9876543210" />
                  </div>
                </>
              )}
              <div className="form-group full">
                <label>Address</label>
                <textarea {...register('address')} rows={2} placeholder="Street, City" style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group full">
                <label>Notes</label>
                <textarea {...register('notes')} rows={2} placeholder="Any notes about this student" style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group full" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
                <label>{student ? 'Add to Batch' : 'Enroll in Batch'}</label>
                {student && student.active_batches?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)', alignSelf: 'center' }}>Current:</span>
                    {student.active_batches.map((name, i) => (
                      <span key={i} className="badge badge-gray">{name}</span>
                    ))}
                  </div>
                )}
                <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
                  <option value="">— Select a batch (optional) —</option>
                  {(batchesData?.batches ?? []).map((b) => {
                    const bCourse = (b as unknown as Record<string, unknown>)['courses'] as Record<string, string> | null
                    const bTeacher = (b as unknown as Record<string, unknown>)['teachers'] as Record<string, string> | null
                    return (
                      <option key={b.id} value={b.id}>
                        {b.name}
                        {bCourse ? ` — ${bCourse['name'] ?? ''}` : ''}
                        {bTeacher ? ` (${bTeacher['full_name'] ?? ''})` : ''}
                      </option>
                    )
                  })}
                </select>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  {student
                    ? 'Selecting a batch will enroll this student immediately when you save.'
                    : 'Selecting a batch will enroll this student immediately. The assigned teacher will see them right away.'}
                </div>
              </div>
              {!student && watch('email') && (
                <div style={{ gridColumn: '1 / -1', background: 'rgba(139,46,63,0.04)', border: '1px solid rgba(139,46,63,0.15)', borderRadius: 6, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="send_invite"
                    checked={sendInvite}
                    onChange={e => setSendInvite(e.target.checked)}
                    style={{ marginTop: 2, accentColor: '#8B2E3F', width: 14, height: 14, cursor: 'pointer' }}
                  />
                  <label htmlFor="send_invite" style={{ cursor: 'pointer', fontSize: 13, lineHeight: 1.4 }}>
                    <strong style={{ color: '#2C1810' }}>Send portal invite email</strong>
                    <br />
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>Student will receive a link to set their password and access the student portal.</span>
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="sheet-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : (student ? 'Save Changes' : 'Add Student')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default function StudentsPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showSheet, setShowSheet] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | undefined>()
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, refetch } = useStudents({ search: debouncedSearch, status: statusFilter })
  const deleteStudent = useDeleteStudent()

  const students = data?.students ?? []
  const total = data?.total ?? 0

  const handleEdit = useCallback((s: Student) => {
    setEditStudent(s)
    setShowSheet(true)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    await deleteStudent.mutateAsync(id)
    toast('Student deleted')
  }, [deleteStudent, toast])

  const handleCloseSheet = useCallback(() => {
    setShowSheet(false)
    setEditStudent(undefined)
  }, [])

  const handleSaved = useCallback(() => {
    void refetch()
  }, [refetch])

  return (
    <>
      <PageHeader
        title={`Students${total ? ` (${total})` : ''}`}
        description="Manage all enrolled students"
        action={
          <RoleGuard allowedRoles={['director']}>
            <button className="btn btn-primary" onClick={() => { setEditStudent(undefined); setShowSheet(true) }}>
              + Add Student
            </button>
          </RoleGuard>
        }
      />

      {/* Search + filters */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`filter-tab${statusFilter === tab.value ? ' active' : ''}`}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {isLoading ? (
          <div className="loading-center"><span className="spinner" /> Loading students…</div>
        ) : students.length === 0 ? (
          <EmptyState
            icon="◎"
            title="No students found"
            description={search ? 'Try a different search term' : 'Add your first student using the button above'}
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Batches</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/students/${s.id}`} style={{ fontWeight: 600, color: 'var(--burgundy)', textDecoration: 'none' }}>
                        {s.full_name}
                      </Link>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>{s.phone}</td>
                    <td>
                      {s.student_type && (
                        <span>{typeEmoji[s.student_type as StudentType]} <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{s.student_type}</span></span>
                      )}
                    </td>
                    <td>
                      {s.active_batches?.length > 0
                        ? s.active_batches.map((b, i) => (
                            <span key={i} className="badge badge-gray" style={{ marginRight: 4 }}>{b}</span>
                          ))
                        : <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>
                      }
                    </td>
                    <td>
                      <span className={`badge ${statusBadge[s.status as StudentStatus] ?? 'badge-gray'}`}>
                        {s.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>{formatDate(s.enrollment_date)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <RoleGuard allowedRoles={['director']}>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                        </RoleGuard>
                        <RoleGuard allowedRoles={['director']}>
                          <ConfirmDialog
                            title="Delete Student"
                            description={`Are you sure you want to delete ${s.full_name}? This cannot be undone.`}
                            confirmLabel="Delete"
                            variant="danger"
                            onConfirm={() => handleDelete(s.id)}
                            trigger={<button className="btn btn-danger btn-sm">Delete</button>}
                          />
                        </RoleGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showSheet && (
        <StudentSheet
          student={editStudent}
          onClose={handleCloseSheet}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
