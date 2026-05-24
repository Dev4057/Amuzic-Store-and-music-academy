import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api-client'
import { queryKeys } from '../lib/query-keys'
import { useAuth } from './useAuth'
import type { Batch } from '@amuzic/shared'

interface DashboardData {
  total_active_students: number
  total_pending_fees: number
  demos_booked_this_month: number
  todays_classes: Pick<Batch, 'id' | 'name' | 'schedule_time' | 'course_id'>[]
  fee_collection_this_month: number
  overdue_fees_count: number
}

export function useDashboard() {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.get<{ data: DashboardData }>('/api/dashboard', accessToken!),
    enabled: !!accessToken,
  })
}
