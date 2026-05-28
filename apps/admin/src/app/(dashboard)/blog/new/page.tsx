'use client'

import { PageHeader } from '../../../../components/PageHeader'
import { RoleGuard } from '../../../../components/RoleGuard'
import BlogEditor from '../../../../components/blog/BlogEditor'
import { useCreateBlogPost } from '../../../../hooks/useBlog'

export default function NewBlogPostPage() {
  const create = useCreateBlogPost()

  return (
    <RoleGuard allowedRoles={['director']}>
      <PageHeader title="New Post" description="Create a new insight or article" />
      <BlogEditor
        onSave={(data) => create.mutateAsync(data)}
        isSaving={create.isPending}
      />
    </RoleGuard>
  )
}
