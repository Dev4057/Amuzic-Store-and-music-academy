'use client'

import { useParams } from 'next/navigation'
import { PageHeader } from '../../../../components/PageHeader'
import { RoleGuard } from '../../../../components/RoleGuard'
import BlogEditor from '../../../../components/blog/BlogEditor'
import { useBlogPost, useUpdateBlogPost } from '../../../../hooks/useBlog'

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useBlogPost(id)
  const update = useUpdateBlogPost(id)

  return (
    <RoleGuard allowedRoles={['director']}>
      <PageHeader title="Edit Post" description="Update your insight or article" />
      {isLoading ? (
        <div className="loading-center"><span className="spinner" /> Loading post…</div>
      ) : !data?.data ? (
        <div style={{ color: 'var(--muted)' }}>Post not found.</div>
      ) : (
        <BlogEditor
          initial={data.data}
          onSave={(body) => update.mutateAsync(body)}
          isSaving={update.isPending}
        />
      )}
    </RoleGuard>
  )
}
