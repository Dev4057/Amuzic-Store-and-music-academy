'use client'

import { useState } from 'react'
import { useDemos, useUpdateDemoStatus } from '../../../hooks/useDemos'
import { RoleGuard } from '../../../components/RoleGuard'
import { EmptyState } from '../../../components/EmptyState'
import { PageHeader } from '../../../components/PageHeader'
import { useToast } from '../../../components/Toast'
import { formatDate } from '@amuzic/shared'
import type { DemoBooking, DemoStatus } from '@amuzic/shared'

const STATUS_BADGE: Record<DemoStatus, string> = {
  new: 'badge-teal',
  contacted: 'badge-amber',
  scheduled: 'badge-purple',
  completed: 'badge-green',
  cancelled: 'badge-red',
}

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface DemoDetailSheet {
  demo: DemoBooking
  onClose: () => void
}

function DemoDetailSheet({ demo, onClose }: DemoDetailSheet) {
  const { toast } = useToast()
  const updateStatus = useUpdateDemoStatus()
  const [status, setStatus] = useState(demo.status)
  const [notes, setNotes] = useState('')

  async function handleSave() {
    try {
      await updateStatus.mutateAsync({ id: demo.id, status, notes: notes || undefined })
      toast('Demo status updated')
      onClose()
    } catch {
      toast('Failed to update status', 'error')
    }
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-panel">
        <div className="sheet-header">
          <h2 className="sheet-title">Demo Booking</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-body">
          <div className="info-grid" style={{ marginBottom: 24 }}>
            {[
              ['Name', demo.full_name],
              ['Phone', demo.phone],
              ['Email', demo.email ?? '—'],
              ['Course Interest', demo.course_interest ?? '—'],
              ['Student Type', demo.student_type ?? '—'],
              ['Preferred Date', demo.preferred_date ? formatDate(demo.preferred_date) : '—'],
              ['Preferred Time', demo.preferred_time ?? '—'],
              ['Booked', timeAgo(demo.created_at)],
            ].map(([label, value]) => (
              <div key={label} className="info-item">
                <label>{label}</label>
                <div className="info-item-value">{value}</div>
              </div>
            ))}
          </div>

          {demo.message && (
            <div style={{ marginBottom: 20 }}>
              <label>Message</label>
              <div className="info-item-value" style={{ marginTop: 4, fontStyle: 'italic' }}>"{demo.message}"</div>
            </div>
          )}

          <RoleGuard allowedRoles={['director']}>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Update Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as DemoStatus)}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Add Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Called at 3pm, interested in keyboard…"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </RoleGuard>
        </div>
        <div className="sheet-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <RoleGuard allowedRoles={['director']}>
            <button className="btn btn-primary" onClick={() => { void handleSave() }} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? 'Saving…' : 'Save'}
            </button>
          </RoleGuard>
        </div>
      </div>
    </>
  )
}

export default function DemosPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<DemoBooking | null>(null)

  const { data, isLoading } = useDemos({
    status: statusFilter || undefined,
    course_interest: courseFilter || undefined,
    search: search || undefined,
  })
  const demos = data?.demos ?? []
  const total = data?.total ?? 0

  return (
    <>
      <PageHeader
        title={`Demo Bookings${total ? ` (${total})` : ''}`}
        description="Leads from the website demo booking form"
      />

      {/* Filters */}
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
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} style={{ width: 160 }}>
          <option value="">All Courses</option>
          <option value="keyboard">Keyboard</option>
          <option value="guitar">Guitar</option>
          <option value="drums">Drums</option>
          <option value="vocals">Vocals</option>
        </select>
      </div>

      <div className="filter-tabs">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            className={`filter-tab${statusFilter === t.value ? ' active' : ''}`}
            onClick={() => setStatusFilter(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {isLoading ? (
          <div className="loading-center"><span className="spinner" /> Loading demos…</div>
        ) : demos.length === 0 ? (
          <EmptyState icon="◇" title="No demo bookings" description="Bookings from the website will appear here" />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Type</th>
                  <th>Preferred</th>
                  <th>Status</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {demos.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelected(d)}
                    style={{ cursor: 'pointer' }}
                    className={d.status === 'new' ? 'new-demo-row' : ''}
                  >
                    <td>
                      <div style={{ fontWeight: 600 }}>{d.full_name}</div>
                      {d.email && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{d.email}</div>}
                    </td>
                    <td style={{ fontSize: 13 }}>{d.phone}</td>
                    <td>
                      {d.course_interest ? (
                        <span className={`badge ${d.course_interest === 'keyboard' ? 'badge-blue' : d.course_interest === 'guitar' ? 'badge-green' : d.course_interest === 'drums' ? 'badge-red' : 'badge-purple'}`}>
                          {d.course_interest}
                        </span>
                      ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </td>
                    <td style={{ fontSize: 13, textTransform: 'capitalize' }}>{d.student_type ?? '—'}</td>
                    <td style={{ fontSize: 13 }}>
                      {d.preferred_date ? formatDate(d.preferred_date) : '—'}
                      {d.preferred_time ? ` ${d.preferred_time}` : ''}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[d.status as DemoStatus] ?? 'badge-gray'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{timeAgo(d.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <DemoDetailSheet demo={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
