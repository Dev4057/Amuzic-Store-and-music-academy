import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api-client'
import { queryKeys } from '../lib/query-keys'
import { useAuth } from './useAuth'
import type { Teacher } from '@amuzic/shared'

interface TeacherWithStats extends Teacher {
  active_batch_count: number
  total_student_count: number
}

interface TeachersResponse {
  teachers: TeacherWithStats[]
}

export function useTeachers() {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.teachers,
    queryFn: () => api.get<TeachersResponse>('/api/teachers', accessToken!),
    enabled: !!accessToken,
  })
}

export function useCreateTeacher() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Teacher>) => api.post<{ data: Teacher }>('/api/teachers', body, accessToken!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.teachers }) },
  })
}

export function useUpdateTeacher(id: string) {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Teacher>) => api.patch<{ data: Teacher }>(`/api/teachers/${id}`, body, accessToken!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.teachers }) },
  })
}
