'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useBatches, useCreateBatch } from '../../../hooks/useBatches'
import { useTeachers } from '../../../hooks/useTeachers'
import { useCourses } from '../../../hooks/useCourses'
import { RoleGuard } from '../../../components/RoleGuard'
import { EmptyState } from '../../../components/EmptyState'
import { PageHeader } from '../../../components/PageHeader'
import { useToast } from '../../../components/Toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateBatchSchema } from '@amuzic/shared'
import type { BatchStatus } from '@amuzic/shared'

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

const COURSE_BADGES: Record<string, string> = {
  keyboard: 'badge-blue',
  guitar: 'badge-green',
  drums: 'badge-red',
  vocals: 'badge-purple',
}

const STATUS_BADGE: Record<BatchStatus, string> = {
  active: 'badge-green',
  inactive: 'badge-gray',
  completed: 'badge-amber',
}

interface BatchFormProps {
  onClose: () => void
  courseId?: string
}

function BatchSheet({ onClose }: BatchFormProps) {
  const { toast } = useToast()
  const createBatch = useCreateBatch()
  const { data: teachersData } = useTeachers()
  const teachers = teachersData?.teachers ?? []
  const { data: coursesData } = useCourses()
  const courses = coursesData?.data ?? []
  type Day = typeof DAYS_OF_WEEK[number]
  const [selectedDays, setSelectedDays] = useState<Day[]>([])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(CreateBatchSchema),
    defaultValues: { duration_minutes: 45, max_students: 8, schedule_days: [] as Day[] },
  })

  function toggleDay(day: Day) {
    setSelectedDays((prev) => {
      const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
      setValue('schedule_days', next)
      return next
    })
  }

  async function onSubmit(data: Record<string, unknown>) {
    try {
      await createBatch.mutateAsync(data)
      toast('Batch created')
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : null
      toast(msg ?? 'Failed to create batch', 'error')
    }
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-panel">
        <div className="sheet-header">
          <h2 className="sheet-title">Create Batch</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={(e) => { void handleSubmit(onSubmit)(e) }} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="sheet-body">
            <div className="form-grid">
              <div className="form-group full">
                <label>Batch Name *</label>
                <input type="text" {...register('name')} placeholder="Evening Guitar Batch A" />
                {errors.name && <div className="field-error">{errors.name.message}</div>}
              </div>
              <div className="form-group">
                <label>Course *</label>
                <select {...register('course_id')}>
                  <option value="">— Select a course —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.course_id && <div className="field-error">Please select a course</div>}
              </div>
              <div className="form-group">
                <label>Teacher</label>
                <select {...register('teacher_id')}>
                  <option value="">No teacher assigned</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group full">
                <label>Schedule Days *</label>
                <div className="checkbox-group">
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(day)}
                        onChange={() => toggleDay(day)}
                      />
                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                    </label>
                  ))}
                </div>
                {errors.schedule_days && <div className="field-error">Select at least one day</div>}
              </div>
              <div className="form-group">
                <label>Class Time *</label>
                <input type="time" {...register('schedule_time')} />
                {errors.schedule_time && <div className="field-error">Valid time required</div>}
              </div>
              <div className="form-group">
                <label>Duration</label>
                <select {...register('duration_minutes', { valueAsNumber: true })}>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Max Students</label>
                <input type="number" {...register('max_students', { valueAsNumber: true })} min={1} max={30} />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" {...register('start_date')} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" {...register('end_date')} />
              </div>
            </div>
          </div>
          <div className="sheet-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createBatch.isPending}>
              {createBatch.isPending ? 'Creating…' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default function BatchesPage() {
  const [courseFilter, setCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showSheet, setShowSheet] = useState(false)

  const { data, isLoading } = useBatches({ status: statusFilter || undefined })
  const batches = data?.batches ?? []

  const filtered = courseFilter
    ? batches.filter((b) => (b.courses as { slug?: string } | null)?.slug === courseFilter)
    : batches

  return (
    <>
      <PageHeader
        title={`Batches${batches.length ? ` (${batches.length})` : ''}`}
        description="Schedule and manage class batches"
        action={
          <RoleGuard allowedRoles={['director']}>
            <button className="btn btn-primary" onClick={() => setShowSheet(true)}>+ Create Batch</button>
          </RoleGuard>
        }
      />

      <div className="search-bar">
        <div className="filter-tabs" style={{ marginBottom: 0, flex: 1 }}>
          {[
            { label: 'All Courses', value: '' },
            { label: 'Keyboard', value: 'keyboard' },
            { label: 'Guitar', value: 'guitar' },
            { label: 'Drums', value: 'drums' },
            { label: 'Vocals', value: 'vocals' },
          ].map((c) => (
            <button
              key={c.value}
              className={`filter-tab${courseFilter === c.value ? ' active' : ''}`}
              onClick={() => setCourseFilter(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 140 }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="loading-center"><span className="spinner" /> Loading batches…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="◈" title="No batches found" description="Create your first batch above" />
      ) : (
        <div className="cards-grid">
          {filtered.map((b) => {
            const course = b.courses as { name: string; slug: string } | null
            const teacher = b.teachers as { full_name: string } | null
            const fillPct = b.max_students > 0 ? Math.round((b.enrolled_count / b.max_students) * 100) : 0
            return (
              <div key={b.id} className="batch-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 className="batch-card-name">{b.name}</h3>
                  <span className={`badge ${STATUS_BADGE[b.status as BatchStatus] ?? 'badge-gray'}`}>{b.status}</span>
                </div>
                {course && (
                  <span className={`badge ${COURSE_BADGES[course.slug] ?? 'badge-gray'}`} style={{ marginBottom: 10, display: 'inline-flex' }}>
                    {course.name}
                  </span>
                )}
                <div className="batch-card-meta">
                  <strong>Teacher:</strong> {teacher?.full_name ?? 'Unassigned'}
                </div>
                <div className="batch-card-meta">
                  <strong>Schedule:</strong> {b.schedule_days?.join(', ')} at {b.schedule_time}
                </div>
                <div className="batch-card-meta">
                  <strong>Duration:</strong> {b.duration_minutes} min
                </div>
                <div className="batch-card-meta" style={{ marginTop: 8 }}>
                  <strong>{b.enrolled_count}/{b.max_students}</strong> students
                </div>
                <div className="progress-bar" style={{ marginBottom: 14 }}>
                  <div className="progress-bar-fill" style={{ width: `${fillPct}%` }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/attendance?batch=${b.id}`} className="btn btn-ghost btn-sm">Mark Attendance</Link>
                  <Link href={`/batches/${b.id}`} className="btn btn-primary btn-sm">View Details</Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showSheet && <BatchSheet onClose={() => setShowSheet(false)} />}
    </>
  )
}
