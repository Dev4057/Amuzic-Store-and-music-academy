import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, buildQuery } from '../lib/api-client'
import { queryKeys } from '../lib/query-keys'
import { useAuth } from './useAuth'
import type { Batch } from '@amuzic/shared'

export interface BatchFilters {
  course_id?: string
  status?: string
}

interface BatchesResponse {
  batches: (Batch & { enrolled_count: number })[]
}

export function useBatches(filters: BatchFilters = {}) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.batches.list(filters),
    queryFn: () =>
      api.get<BatchesResponse>(
        `/api/batches?${buildQuery(filters as Record<string, string>)}`,
        accessToken!
      ),
    enabled: !!accessToken,
  })
}

export function useBatch(id: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.batches.detail(id),
    queryFn: () => api.get<{ data: Batch & { students: unknown[] } }>(`/api/batches/${id}`, accessToken!),
    enabled: !!accessToken && !!id,
  })
}

export function useBatchAttendance(id: string, date: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.batches.attendance(id, date),
    queryFn: () => api.get<{ attendance: unknown[] }>(`/api/batches/${id}/attendance?date=${date}`, accessToken!),
    enabled: !!accessToken && !!id && !!date,
  })
}

export function useCreateBatch() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Batch>) => api.post<{ data: Batch }>('/api/batches', body, accessToken!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.batches.all }) },
  })
}

export function useUpdateBatch(id: string) {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Batch>) => api.patch<{ data: Batch }>(`/api/batches/${id}`, body, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.batches.all })
      void qc.invalidateQueries({ queryKey: queryKeys.batches.detail(id) })
    },
  })
}

export function useMarkAttendance(batchId: string) {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { class_date: string; attendance: Array<{ student_id: string; status: string; notes?: string }> }) =>
      api.post<{ count: number }>(`/api/batches/${batchId}/attendance`, body, accessToken!),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.batches.attendance(batchId, variables.class_date) })
    },
  })
}

export function useEnrollStudent(batchId: string) {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (studentId: string) =>
      api.post<{ data: unknown }>(`/api/batches/${batchId}/enroll`, { student_id: studentId }, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.batches.detail(batchId) })
      void qc.invalidateQueries({ queryKey: queryKeys.students.all })
    },
  })
}

export function useUnenrollStudent(batchId: string) {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (studentId: string) =>
      api.delete<{ message: string }>(`/api/batches/${batchId}/enroll/${studentId}`, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.batches.detail(batchId) })
      void qc.invalidateQueries({ queryKey: queryKeys.students.all })
    },
  })
}
