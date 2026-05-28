'use client'

import { useState } from 'react'
import { PageHeader } from '../../../components/PageHeader'
import { RoleGuard } from '../../../components/RoleGuard'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { useToast } from '../../../components/Toast'
import {
  useTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  type Testimonial,
} from '../../../hooks/useTestimonials'

const EMPTY: Partial<Testimonial> = {
  name: '', role: '', quote: '', rating: 5, course: '', student_type: 'adult', is_published: false, display_order: 0,
}

function TestimonialSheet({
  item, onClose,
}: { item?: Testimonial; onClose: () => void }) {
  const { toast } = useToast()
  const create = useCreateTestimonial()
  const update = useUpdateTestimonial(item?.id)
  const [form, setForm] = useState<Partial<Testimonial>>(item ?? EMPTY)

  function set<K extends keyof Testimonial>(key: K, val: Testimonial[K]) {
    setForm((p) => ({ ...p, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (item) {
        await update.mutateAsync({ _id: item.id, ...form })
        toast('Testimonial updated')
      } else {
        await create.mutateAsync(form)
        toast('Testimonial added')
      }
      onClose()
    } catch {
      toast(item ? 'Failed to update' : 'Failed to add', 'error')
    }
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-panel">
        <div className="sheet-header">
          <h2 className="sheet-title">{item ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={(e) => { void handleSubmit(e) }} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="sheet-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <input value={form.role ?? ''} onChange={(e) => set('role', e.target.value)} placeholder="Parent of keyboard student" required />
              </div>
              <div className="form-group">
                <label>Course</label>
                <select value={form.course ?? ''} onChange={(e) => set('course', e.target.value)}>
                  <option value="">— none —</option>
                  <option value="keyboard">Keyboard</option>
                  <option value="guitar">Guitar</option>
                  <option value="drums">Drums</option>
                  <option value="vocals">Vocals</option>
                </select>
              </div>
              <div className="form-group">
                <label>Student Type</label>
                <select value={form.student_type ?? 'adult'} onChange={(e) => set('student_type', e.target.value)}>
                  <option value="child">Child</option>
                  <option value="adult">Adult</option>
                  <option value="senior">Senior</option>
                </select>
              </div>
              <div className="form-group">
                <label>Rating (1–5)</label>
                <input type="number" min={1} max={5} value={form.rating ?? 5} onChange={(e) => set('rating', Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Display Order</label>
                <input type="number" min={0} value={form.display_order ?? 0} onChange={(e) => set('display_order', Number(e.target.value))} />
              </div>
              <div className="form-group full">
                <label>Quote *</label>
                <textarea rows={4} value={form.quote ?? ''} onChange={(e) => set('quote', e.target.value)} style={{ resize: 'vertical' }} required />
              </div>
              <div className="form-group full">
                <label className="checkbox-item">
                  <input type="checkbox" checked={form.is_published ?? false} onChange={(e) => set('is_published', e.target.checked)} />
                  Published (visible on website)
                </label>
              </div>
            </div>
          </div>
          <div className="sheet-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Saving…' : (item ? 'Save Changes' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default function TestimonialsPage() {
  const { toast } = useToast()
  const { data, isLoading } = useTestimonials()
  const deleteT = useDeleteTestimonial()
  const togglePub = useUpdateTestimonial()
  const [showSheet, setShowSheet] = useState(false)
  const [editItem, setEditItem] = useState<Testimonial | undefined>()

  const items = data?.data ?? []

  return (
    <RoleGuard allowedRoles={['director']}>
      <PageHeader
        title={`Testimonials${items.length ? ` (${items.length})` : ''}`}
        description="Manage testimonials shown on the public website"
        action={
          <button className="btn btn-primary" onClick={() => { setEditItem(undefined); setShowSheet(true) }}>
            + Add Testimonial
          </button>
        }
      />

      {isLoading ? (
        <div className="loading-center"><span className="spinner" /> Loading…</div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Course</th>
                  <th>Rating</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{t.display_order}</td>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>{t.role}</td>
                    <td>{t.course ? <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{t.course}</span> : '—'}</td>
                    <td>{'★'.repeat(t.rating)}</td>
                    <td>
                      <span className={`badge ${t.is_published ? 'badge-green' : 'badge-gray'}`}>
                        {t.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => { setEditItem(t); setShowSheet(true) }}
                        >
                          Edit
                        </button>
                        <button
                          className={`btn btn-sm ${t.is_published ? 'btn-ghost' : 'btn-success'}`}
                          onClick={async () => {
                            try {
                              await togglePub.mutateAsync({ _id: t.id, is_published: !t.is_published })
                              toast(t.is_published ? 'Unpublished' : 'Published')
                            } catch { toast('Failed', 'error') }
                          }}
                        >
                          {t.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <ConfirmDialog
                          title="Delete Testimonial"
                          description={`Remove "${t.name}"'s testimonial permanently?`}
                          confirmLabel="Delete"
                          variant="danger"
                          onConfirm={async () => {
                            await deleteT.mutateAsync(t.id)
                            toast('Deleted')
                          }}
                          trigger={<button className="btn btn-danger btn-sm">Delete</button>}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showSheet && (
        <TestimonialSheet
          item={editItem}
          onClose={() => { setShowSheet(false); setEditItem(undefined) }}
        />
      )}
    </RoleGuard>
  )
}
