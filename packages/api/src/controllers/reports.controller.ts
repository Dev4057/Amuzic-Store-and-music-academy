import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

export async function getReports(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const now = new Date()
    const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthStart = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}-01`
    const lastMonthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    const [
      { data: thisMonthPaid },
      { data: lastMonthPaid },
      { data: pendingFees },
      { data: overdueFees },
      { count: activeStudents },
      { count: newStudents },
      { count: demosThisMonth },
      { count: demosCompleted },
      { count: activeBatches },
      { data: attendanceThisMonth },
    ] = await Promise.all([
      supabase.from('fee_records').select('paid_amount').eq('status', 'paid').gte('paid_date', thisMonthStart),
      supabase.from('fee_records').select('paid_amount').eq('status', 'paid').gte('paid_date', lastMonthStart).lt('paid_date', lastMonthEnd),
      supabase.from('fee_records').select('amount').eq('status', 'pending'),
      supabase.from('fee_records').select('amount').eq('status', 'overdue'),
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('students').select('*', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
      supabase.from('demo_bookings').select('*', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
      supabase.from('demo_bookings').select('*', { count: 'exact', head: true }).gte('created_at', thisMonthStart).eq('status', 'completed'),
      supabase.from('batches').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('attendance').select('status').gte('class_date', thisMonthStart),
    ])

    const this_month_collection = (thisMonthPaid ?? []).reduce((s, r) => s + (r.paid_amount ?? 0), 0)
    const last_month_collection = (lastMonthPaid ?? []).reduce((s, r) => s + (r.paid_amount ?? 0), 0)
    const pending_fees_total = (pendingFees ?? []).reduce((s, r) => s + r.amount, 0)
    const overdue_fees_total = (overdueFees ?? []).reduce((s, r) => s + r.amount, 0)

    const attTotal = attendanceThisMonth?.length ?? 0
    const attPresent = (attendanceThisMonth ?? []).filter((a) => a.status === 'present' || a.status === 'late').length
    const attendance_rate_this_month = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0

    const demos_total = demosThisMonth ?? 0
    const demos_converted = demosCompleted ?? 0
    const conversion_rate = demos_total > 0 ? Math.round((demos_converted / demos_total) * 100) : 0

    res.json({
      data: {
        this_month_collection,
        last_month_collection,
        pending_fees_total,
        overdue_fees_total,
        active_students: activeStudents ?? 0,
        new_students_this_month: newStudents ?? 0,
        demos_this_month: demos_total,
        demos_converted_this_month: demos_converted,
        conversion_rate,
        batches_active: activeBatches ?? 0,
        attendance_rate_this_month,
      },
    })
  } catch (err) {
    next(err)
  }
}
