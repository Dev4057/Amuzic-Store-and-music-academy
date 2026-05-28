import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api-client'
import { queryKeys } from '../lib/query-keys'
import { useAuth } from './useAuth'

export interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
  rating: number
  course?: string
  student_type?: string
  is_published: boolean
  display_order: number
  created_at: string
}

export function useTestimonials() {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.testimonials,
    queryFn: () => api.get<{ data: Testimonial[] }>('/api/testimonials/all', accessToken!),
    enabled: !!accessToken,
  })
}

export function useCreateTestimonial() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Testimonial>) => api.post<{ data: Testimonial }>('/api/testimonials', body, accessToken!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.testimonials }) },
  })
}

export function useUpdateTestimonial(id?: string) {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ _id, ...body }: Partial<Testimonial> & { _id?: string }) =>
      api.patch<{ data: Testimonial }>(`/api/testimonials/${_id ?? id ?? ''}`, body, accessToken!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.testimonials }) },
  })
}

export function useDeleteTestimonial() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/testimonials/${id}`, accessToken!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.testimonials }) },
  })
}
