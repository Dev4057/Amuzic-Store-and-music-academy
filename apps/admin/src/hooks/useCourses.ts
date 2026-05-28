import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api-client'

interface Course {
  id: string
  name: string
  slug: string
  monthly_fee: number
  admission_fee: number
  duration_months: number
  is_active: boolean
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get<{ data: Course[] }>('/api/courses', ''),
    staleTime: 5 * 60 * 1000,
  })
}
