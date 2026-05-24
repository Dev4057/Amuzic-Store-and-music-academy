import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, buildQuery } from '../lib/api-client'
import { queryKeys } from '../lib/query-keys'
import { useAuth } from './useAuth'
import type { FeeRecord } from '@amuzic/shared'

export interface FeeFilters {
  student_id?: string
  status?: string
  month_year?: string
  search?: string
  page?: number
}

interface FeeSummary {
  pending_count: number
  overdue_count: number
  pending_amount: number
  overdue_amount: number
  collected_this_month: number
}

interface FeesResponse {
  fees: (FeeRecord & { students: { full_name: string; phone: string } | null })[]
  total: number
  summary: FeeSummary
}

export function useFees(filters: FeeFilters = {}) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.fees.list(filters),
    queryFn: () =>
      api.get<FeesResponse>(
        `/api/fees?${buildQuery(filters as Record<string, string>)}`,
        accessToken!
      ),
    enabled: !!accessToken,
  })
}

export function useCreateFee() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<FeeRecord>) => api.post<{ data: FeeRecord }>('/api/fees', body, accessToken!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.fees.all }) },
  })
}

export function useRecordPayment(feeId: string, studentId?: string) {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { paid_amount: number; paid_date: string; payment_mode: string; notes?: string }) =>
      api.patch<{ data: FeeRecord }>(`/api/fees/${feeId}/pay`, body, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.fees.all })
      if (studentId) void qc.invalidateQueries({ queryKey: queryKeys.students.fees(studentId) })
    },
  })
}

export function useGenerateMonthlyFees() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { month_year: string; due_date: string }) =>
      api.post<{ created: number; skipped: number }>('/api/fees/generate-monthly', body, accessToken!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.fees.all }) },
  })
}
