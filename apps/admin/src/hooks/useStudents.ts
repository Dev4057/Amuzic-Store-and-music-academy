import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, buildQuery } from '../lib/api-client'
import { queryKeys } from '../lib/query-keys'
import { useAuth } from './useAuth'
import type { Student } from '@amuzic/shared'

export interface StudentFilters {
  search?: string
  status?: string
  student_type?: string
  page?: number
}

interface StudentsResponse {
  students: (Student & { active_batches: string[] })[]
  total: number
  page: number
}

export function useStudents(filters: StudentFilters = {}) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.list(filters),
    queryFn: () =>
      api.get<StudentsResponse>(
        `/api/students?${buildQuery(filters as Record<string, string>)}`,
        accessToken!
      ),
    enabled: !!accessToken,
  })
}

export function useStudent(id: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => api.get<{ data: Student & { enrollments: unknown[] } }>(`/api/students/${id}`, accessToken!),
    enabled: !!accessToken && !!id,
  })
}

export function useStudentAttendance(id: string, month?: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.attendance(id),
    queryFn: () =>
      api.get<{ attendance: unknown[]; summary: { total: number; present: number; rate: number } }>(
        `/api/students/${id}/attendance${month ? `?month=${month}` : ''}`,
        accessToken!
      ),
    enabled: !!accessToken && !!id,
  })
}

export function useStudentFees(id: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.fees(id),
    queryFn: () => api.get<{ fees: unknown[]; summary: { total_paid: number; total_pending: number } }>(`/api/students/${id}/fees`, accessToken!),
    enabled: !!accessToken && !!id,
  })
}

export function useStudentProgress(id: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.students.progress(id),
    queryFn: () => api.get<{ notes: unknown[] }>(`/api/students/${id}/progress`, accessToken!),
    enabled: !!accessToken && !!id,
  })
}

export function useCreateStudent() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Student> & { send_portal_invite?: boolean; batch_id?: string }) =>
      api.post<{ data: Student; invite_sent?: boolean }>('/api/students', body, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.students.all })
      void qc.invalidateQueries({ queryKey: queryKeys.batches.all })
    },
  })
}

export function useUpdateStudent(id: string) {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Student>) => api.patch<{ data: Student }>(`/api/students/${id}`, body, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.students.all })
      void qc.invalidateQueries({ queryKey: queryKeys.students.detail(id) })
    },
  })
}

export function useDeleteStudent() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/api/students/${id}`, accessToken!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.students.all }) },
  })
}
