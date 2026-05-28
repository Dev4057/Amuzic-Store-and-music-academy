import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api-client'
import { queryKeys } from '../lib/query-keys'
import { useAuth } from './useAuth'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url?: string
  tags: string[]
  author_name: string
  is_published: boolean
  published_at?: string
  reading_time_minutes?: number
  created_at: string
  updated_at: string
}

export function useBlogPosts() {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.blog.all,
    queryFn: () => api.get<{ data: BlogPost[] }>('/api/blog/all', accessToken!),
    enabled: !!accessToken,
  })
}

export function useBlogPost(id: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.blog.detail(id),
    queryFn: () => api.get<{ data: BlogPost }>(`/api/blog/id/${id}`, accessToken!),
    enabled: !!accessToken && !!id,
  })
}

export function useCreateBlogPost() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<BlogPost>) => api.post<{ data: BlogPost }>('/api/blog', body, accessToken!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.blog.all }) },
  })
}

export function useUpdateBlogPost(id: string) {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<BlogPost>) => api.patch<{ data: BlogPost }>(`/api/blog/${id}`, body, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.blog.all })
      void qc.invalidateQueries({ queryKey: queryKeys.blog.detail(id) })
    },
  })
}

export function useDeleteBlogPost() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/blog/${id}`, accessToken!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.blog.all }) },
  })
}
