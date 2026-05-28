import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api-client'
import { queryKeys } from '../lib/query-keys'
import { useAuth } from './useAuth'

interface MonthTrend {
  month: string
  collected: number
  pending: number
  overdue: number
}

interface CourseCollection {
  course_name: string
  collected: number
  student_count: number
}

interface MonthSummary {
  collected: number
  pending: number
  overdue: number
  new_admissions: number
  admission_fees_collected: number
}

interface TopPendingStudent {
  student_id: string
  full_name: string
  phone: string
  total_pending: number
  overdue_count: number
}

export interface FinancialsOverview {
  monthly_trend: MonthTrend[]
  collection_by_course: CourseCollection[]
  payment_mode_breakdown: { cash: number; upi: number; bank_transfer: number; cheque: number }
  top_pending_students: TopPendingStudent[]
  this_month: MonthSummary
  last_month: MonthSummary
}

export function useFinancials() {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: queryKeys.financials,
    queryFn: () => api.get<FinancialsOverview>('/api/financials/overview', accessToken!),
    enabled: !!accessToken,
  })
}
