'use client'

import { useState } from 'react'
import { useTeachers, useCreateTeacher, useUpdateTeacher } from '../../../hooks/useTeachers'
import { PageHeader } from '../../../components/PageHeader'
import { EmptyState } from '../../../components/EmptyState'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { useToast } from '../../../components/Toast'
import { formatDate } from '@amuzic/shared'
import type { Teacher } from '@amuzic/shared'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateTeacherSchema } from '@amuzic/shared'

const SPECIALIZATIONS = ['keyboard', 'guitar', 'drums', 'vocals']

const SPEC_BADGE: Record<string, string> = {
  keyboard: 'badge-blue',
  guitar: 'badge-green',
  drums: 'badge-red',
  vocals: 'badge-purple',
}

interface TeacherWithStats extends Teacher {
  active_batch_count: number
  total_student_count: number
}

interface TeacherSheetProps {
  teacher?: TeacherWithStats
  onClose: () => void
}

function TeacherSheet({ teacher, onClose }: TeacherSheetProps) {
  const { toast } = useToast()
  const createTeacher = useCreateTeacher()
  const updateTeacher = useUpdateTeacher(teacher?.id ?? '')
  const [specs, setSpecs] = useState<string[]>(teacher?.specializations ?? [])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreateTeacherSchema),
    defaultValues: teacher
      ? {
          full_name: teacher.full_name,
          phone: teacher.phone,
          email: teacher.email ?? '',
          bio: teacher.bio ?? '',
          joining_date: teacher.joining_date ?? '',
        }
      : {},
  })

  function toggleSpec(s: string) {
    setSpecs((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  async function onSubmit(data: Record<string, unknown>) {
    try {
      if (teacher) {
        await updateTeacher.mutateAsync({ ...data, specializations: specs })
        toast('Teacher updated')
      } else {
        await createTeacher.mutateAsync({ ...data, specializations: specs })
        toast('Teacher added')
      }
      onClose()
    } catch {
      toast(teacher ? 'Failed to update teacher' : 'Failed to add teacher', 'error')
    }
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-panel">
        <div className="sheet-header">
          <h2 className="sheet-title">{teacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={(e) => { void handleSubmit(onSubmit)(e) }} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="sheet-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" {...register('full_name')} placeholder="Teacher name" />
                {errors.full_name && <div className="field-error">{errors.full_name.message}</div>}
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input type="text" {...register('phone')} placeholder="9876543210" />
                {errors.phone && <div className="field-error">10-digit Indian number required</div>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" {...register('email')} placeholder="teacher@amuzic.in" />
              </div>
              <div className="form-group">
                <label>Joining Date</label>
                <input type="date" {...register('joining_date')} />
              </div>
              <div className="form-group full">
                <label>Specializations</label>
                <div className="checkbox-group">
                  {SPECIALIZATIONS.map((s) => (
                    <label key={s} className="checkbox-item">
                      <input type="checkbox" checked={specs.includes(s)} onChange={() => toggleSpec(s)} />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group full">
                <label>Bio</label>
                <textarea {...register('bio')} rows={3} placeholder="Brief bio about the teacher…" style={{ resize: 'vertical' }} />
              </div>
            </div>
          </div>
          <div className="sheet-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createTeacher.isPending || updateTeacher.isPending}>
              {createTeacher.isPending || updateTeacher.isPending ? 'Saving…' : (teacher ? 'Save Changes' : 'Add Teacher')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default function TeachersPage() {
  const [showSheet, setShowSheet] = useState(false)
  const [editTeacher, setEditTeacher] = useState<TeacherWithStats | undefined>()
  const { toast } = useToast()
  const { data, isLoading } = useTeachers()
  const toggleActive = useUpdateTeacher('')
  const teachers = (data?.teachers ?? []) as TeacherWithStats[]

  return (
    <>
      <PageHeader
        title={`Teachers${teachers.length ? ` (${teachers.length})` : ''}`}
        description="Manage teaching staff at Amuzic Academy"
        action={
          <button className="btn btn-primary" onClick={() => { setEditTeacher(undefined); setShowSheet(true) }}>
            + Add Teacher
          </button>
        }
      />

      {isLoading ? (
        <div className="loading-center"><span className="spinner" /> Loading teachers…</div>
      ) : teachers.length === 0 ? (
        <EmptyState icon="⬤" title="No teachers yet" description="Add your first teacher using the button above" />
      ) : (
        <div className="cards-grid">
          {teachers.map((t) => (
            <div key={t.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                <div className="avatar avatar-lg" style={{ background: t.is_active ? 'var(--burgundy)' : '#9CA3AF' }}>
                  {t.full_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.full_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.phone}</div>
                  {t.email && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.email}</div>}
                </div>
                <span className={`badge ${t.is_active ? 'badge-green' : 'badge-gray'}`}>
                  {t.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                {t.specializations?.map((s) => (
                  <span key={s} className={`badge ${SPEC_BADGE[s] ?? 'badge-gray'}`}>{s}</span>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{ background: 'var(--cream)', borderRadius: 4, padding: '10px 12px' }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{t.active_batch_count}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Active Batches</div>
                </div>
                <div style={{ background: 'var(--cream)', borderRadius: 4, padding: '10px 12px' }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{t.total_student_count}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Students</div>
                </div>
              </div>

              {t.joining_date && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
                  Joined {formatDate(t.joining_date)}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditTeacher(t); setShowSheet(true) }}>
                  Edit
                </button>
                <ConfirmDialog
                  title={t.is_active ? 'Deactivate Teacher' : 'Activate Teacher'}
                  description={t.is_active ? `Deactivate ${t.full_name}? They will not appear in batch assignments.` : `Reactivate ${t.full_name}?`}
                  confirmLabel={t.is_active ? 'Deactivate' : 'Activate'}
                  variant={t.is_active ? 'danger' : 'default'}
                  onConfirm={async () => {
                    await toggleActive.mutateAsync({ is_active: !t.is_active })
                    toast(t.is_active ? 'Teacher deactivated' : 'Teacher activated')
                  }}
                  trigger={
                    <button className={`btn btn-sm ${t.is_active ? 'btn-danger' : 'btn-success'}`}>
                      {t.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {showSheet && (
        <TeacherSheet
          teacher={editTeacher}
          onClose={() => { setShowSheet(false); setEditTeacher(undefined) }}
        />
      )}
    </>
  )
}
