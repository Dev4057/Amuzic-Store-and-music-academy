'use client'

import Link from 'next/link'
import { PageHeader } from '../../../components/PageHeader'
import { RoleGuard } from '../../../components/RoleGuard'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { useToast } from '../../../components/Toast'
import { useBlogPosts, useDeleteBlogPost, useUpdateBlogPost } from '../../../hooks/useBlog'
import { formatDate } from '@amuzic/shared'

export default function BlogListPage() {
  const { toast } = useToast()
  const { data, isLoading } = useBlogPosts()
  const deletePost = useDeleteBlogPost()
  const posts = data?.data ?? []

  return (
    <RoleGuard allowedRoles={['director']}>
      <PageHeader
        title={`Blog${posts.length ? ` (${posts.length})` : ''}`}
        description="Manage insights and articles published on the website"
        action={
          <Link href="/blog/new" className="btn btn-primary">+ New Post</Link>
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
                  <th>Title</th>
                  <th>Tags</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Reading Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>No posts yet. Create your first insight!</td></tr>
                ) : posts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: 320 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>/{p.slug}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(p.tags ?? []).map((tag) => (
                          <span key={tag} className="badge badge-gray">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.is_published ? 'badge-green' : 'badge-amber'}`}>
                        {p.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{p.published_at ? formatDate(p.published_at) : '—'}</td>
                    <td style={{ fontSize: 13 }}>{p.reading_time_minutes ? `${p.reading_time_minutes} min` : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/blog/${p.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                        <ConfirmDialog
                          title="Delete Post"
                          description={`Delete "${p.title}" permanently?`}
                          confirmLabel="Delete"
                          variant="danger"
                          onConfirm={async () => {
                            await deletePost.mutateAsync(p.id)
                            toast('Post deleted')
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
    </RoleGuard>
  )
}
