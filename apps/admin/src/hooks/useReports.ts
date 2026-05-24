import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api-client'
import { queryKeys } from '../lib/query-keys'
import { useAuth } from './useAuth'

interface ReportsData {
  this_month_collection: number
  last_month_collection: number
  pending_fees_total: number
  overdue_fees_total: number
  active_students: number
  new_students_this_month: number
  demos_this_month: number
  demos_converted_this_month: number
  conversion_rate: number
  batches_active: number
  attendance_rate_this_month: number
}

export function useReports() {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.reports,
    queryFn: () => api.get<{ data: ReportsData }>('/api/reports', accessToken!),
    enabled: !!accessToken,
  })
}
