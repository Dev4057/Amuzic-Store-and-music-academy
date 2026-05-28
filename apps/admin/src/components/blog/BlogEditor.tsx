'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '../Toast'
import type { BlogPost } from '../../hooks/useBlog'

type BlogFormData = Pick<BlogPost, 'title' | 'slug' | 'excerpt' | 'content' | 'cover_image_url' | 'tags' | 'author_name' | 'is_published' | 'reading_time_minutes'>

interface BlogEditorProps {
  initial?: Partial<BlogPost>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (data: Partial<BlogPost>) => Promise<any>
  isSaving: boolean
}

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function BlogEditor({ initial, onSave, isSaving }: BlogEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState<Partial<BlogFormData>>({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    excerpt: initial?.excerpt ?? '',
    content: initial?.content ?? '',
    cover_image_url: initial?.cover_image_url ?? '',
    tags: initial?.tags ?? [],
    author_name: initial?.author_name ?? 'Amuzic Academy',
    is_published: initial?.is_published ?? false,
    reading_time_minutes: initial?.reading_time_minutes,
  })
  const [tagInput, setTagInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [slugManual, setSlugManual] = useState(!!initial?.slug)

  function setField<K extends keyof BlogFormData>(key: K, val: BlogFormData[K]) {
    setForm((p) => ({ ...p, [key]: val }))
  }

  const handleTitleChange = useCallback((val: string) => {
    setField('title', val)
    if (!slugManual) setField('slug', toSlug(val))
    const words = countWords(form.content ?? '')
    setField('reading_time_minutes', Math.max(1, Math.ceil(words / 200)))
  }, [slugManual, form.content])

  const handleContentChange = useCallback((val: string) => {
    setField('content', val)
    setField('reading_time_minutes', Math.max(1, Math.ceil(countWords(val) / 200)))
  }, [])

  function addTag() {
    const tag = tagInput.trim().toLowerCase()
    if (!tag) return
    setField('tags', [...new Set([...(form.tags ?? []), tag])])
    setTagInput('')
  }

  function removeTag(tag: string) {
    setField('tags', (form.tags ?? []).filter((t) => t !== tag))
  }

  async function handleSubmit(published: boolean) {
    if (!form.title || !form.slug || !form.excerpt || !form.content) {
      toast('Title, slug, excerpt, and content are required', 'error')
      return
    }
    try {
      await onSave({ ...form, is_published: published })
      toast(published ? 'Post published!' : 'Draft saved')
      router.push('/blog')
    } catch {
      toast('Failed to save post', 'error')
    }
  }

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          value={form.title ?? ''}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="How Learning an Instrument Changed My Life"
          style={{ fontSize: 18, fontWeight: 600 }}
        />
      </div>

      {/* Slug */}
      <div className="form-group">
        <label>Slug *</label>
        <input
          type="text"
          value={form.slug ?? ''}
          onChange={(e) => { setSlugManual(true); setField('slug', e.target.value) }}
          placeholder="auto-generated-from-title"
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
          Will be accessible at /insights/{form.slug || '…'}
        </div>
      </div>

      {/* Excerpt */}
      <div className="form-group">
        <label>Excerpt * <span style={{ fontSize: 11, color: 'var(--muted)' }}>({(form.excerpt ?? '').length}/200 chars)</span></label>
        <textarea
          rows={2}
          maxLength={200}
          value={form.excerpt ?? ''}
          onChange={(e) => setField('excerpt', e.target.value)}
          placeholder="A short description shown on the blog listing page"
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Content with preview toggle */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ margin: 0 }}>Content * <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>(Markdown)</span></label>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
        {showPreview ? (
          <div
            className="card"
            style={{ padding: 20, minHeight: 300, fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {form.content || <span style={{ color: 'var(--muted)' }}>Nothing to preview yet…</span>}
          </div>
        ) : (
          <textarea
            rows={16}
            value={form.content ?? ''}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Write your post in Markdown…"
            style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }}
          />
        )}
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
          {countWords(form.content ?? '')} words · ~{form.reading_time_minutes ?? 1} min read
        </div>
      </div>

      {/* Tags */}
      <div className="form-group">
        <label>Tags</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="Add a tag and press Enter"
          />
          <button type="button" className="btn btn-ghost" onClick={addTag}>Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(form.tags ?? []).map((tag) => (
            <span key={tag} className="badge badge-gray" style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)}>
              {tag} ✕
            </span>
          ))}
        </div>
      </div>

      {/* Cover Image */}
      <div className="form-group">
        <label>Cover Image URL</label>
        <input
          type="url"
          value={form.cover_image_url ?? ''}
          onChange={(e) => setField('cover_image_url', e.target.value)}
          placeholder="https://..."
        />
      </div>

      {/* Author */}
      <div className="form-group">
        <label>Author Name</label>
        <input
          type="text"
          value={form.author_name ?? ''}
          onChange={(e) => setField('author_name', e.target.value)}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={() => router.push('/blog')}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => { void handleSubmit(false) }}
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : 'Save Draft'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => { void handleSubmit(true) }}
          disabled={isSaving}
        >
          {isSaving ? 'Publishing…' : (form.is_published ? 'Update & Publish' : 'Publish')}
        </button>
      </div>
    </div>
  )
}
