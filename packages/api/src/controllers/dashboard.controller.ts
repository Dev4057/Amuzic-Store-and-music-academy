import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

export async function getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const today = new Date().toISOString().split('T')[0]!
    const todayDay = new Date()
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase()
    const monthStart = today.slice(0, 7) + '-01'

    const [
      { count: totalStudents },
      { data: pendingFees },
      { count: demosThisMonth },
      { data: todayBatches },
      { data: paidFeesThisMonth },
      { count: overdueCount },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('fee_records').select('*').in('status', ['pending', 'overdue']),
      supabase.from('demo_bookings').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
      supabase.from('batches').select('*').eq('status', 'active').contains('schedule_days', [todayDay]),
      supabase.from('fee_records').select('*').eq('status', 'paid').gte('paid_date', monthStart),
      supabase.from('fee_records').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
    ])

    const totalPendingFees = (pendingFees ?? []).reduce((sum, r) => sum + (r.amount ?? 0), 0)
    const feeCollectionThisMonth = (paidFeesThisMonth ?? []).reduce(
      (sum, r) => sum + (r.paid_amount ?? 0),
      0
    )

    res.json({
      data: {
        total_active_students: totalStudents ?? 0,
        total_pending_fees: totalPendingFees,
        demos_booked_this_month: demosThisMonth ?? 0,
        todays_classes: (todayBatches ?? []).map((b) => ({
          id: b.id,
          name: b.name,
          schedule_time: b.schedule_time,
          course_id: b.course_id,
        })),
        fee_collection_this_month: feeCollectionThisMonth,
        overdue_fees_count: overdueCount ?? 0,
      },
    })
  } catch (err) {
    next(err)
  }
}
