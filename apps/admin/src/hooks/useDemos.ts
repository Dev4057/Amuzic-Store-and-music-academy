import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, buildQuery } from '../lib/api-client'
import { queryKeys } from '../lib/query-keys'
import { useAuth } from './useAuth'
import type { DemoBooking } from '@amuzic/shared'

export interface DemoFilters {
  status?: string
  search?: string
  course_interest?: string
  page?: number
}

interface DemosResponse {
  demos: DemoBooking[]
  total: number
}

export function useDemos(filters: DemoFilters = {}) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.demos.list(filters),
    queryFn: () =>
      api.get<DemosResponse>(
        `/api/demos?${buildQuery(filters as Record<string, string>)}`,
        accessToken!
      ),
    enabled: !!accessToken,
  })
}

export function useUpdateDemoStatus() {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      api.patch<{ data: DemoBooking }>(`/api/demos/${id}/status`, { status, notes }, accessToken!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.demos.all }) },
  })
}
