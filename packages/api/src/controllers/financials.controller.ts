import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

function monthLabel(date: Date): string {
  return date.toLocaleString('en-IN', { month: 'short', year: 'numeric' })
}

function startOfMonth(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-01`
}

function endOfMonth(year: number, month: number): string {
  const last = new Date(year, month + 1, 0)
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export async function getFinancialsOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const now = new Date()
    const thisYear = now.getFullYear()
    const thisMonth = now.getMonth()

    // Build last-6-months windows
    const months: { label: string; start: string; end: string; key: string }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1)
      months.push({
        label: monthLabel(d),
        start: startOfMonth(d.getFullYear(), d.getMonth()),
        end: endOfMonth(d.getFullYear(), d.getMonth()),
        key: monthKey(d.getFullYear(), d.getMonth()),
      })
    }

    const thisMonthKey = months[5]!.key   // e.g. '2026-05'
    const lastMonthKey = months[4]!.key   // e.g. '2026-04'
    const allMonthKeys = months.map((m) => m.key)

    // Run all queries in parallel
    const [
      monthlyFeesResult,
      nullMonthFeesResult,
      admissionsThisResult,
      admissionsLastResult,
      topPendingResult,
    ] = await Promise.all([
      // Fees that belong to one of the 6 periods (monthly fees have month_year set)
      supabase
        .from('fee_records')
        .select('amount, paid_amount, status, payment_mode, due_date, paid_date, fee_type, batch_id, month_year')
        .in('month_year', allMonthKeys),

      // Fees without month_year (admission fees etc.) paid in the 6-month window
      supabase
        .from('fee_records')
        .select('amount, paid_amount, status, payment_mode, due_date, paid_date, fee_type, batch_id, month_year')
        .is('month_year', null)
        .gte('paid_date', months[0]!.start),

      // New admissions this month
      supabase
        .from('students')
        .select('id')
        .gte('enrollment_date', months[5]!.start)
        .lte('enrollment_date', months[5]!.end),

      // New admissions last month
      supabase
        .from('students')
        .select('id')
        .gte('enrollment_date', months[4]!.start)
        .lte('enrollment_date', months[4]!.end),

      // All pending/overdue for top-students widget
      supabase
        .from('fee_records')
        .select('student_id, amount, paid_amount, status, students(full_name, phone)')
        .in('status', ['pending', 'overdue']),
    ])

    if (monthlyFeesResult.error) return next(monthlyFeesResult.error)

    const allFees = [...(monthlyFeesResult.data ?? []), ...(nullMonthFeesResult.data ?? [])]

    // Monthly trend — group by month_year so due-date-in-next-month fees land in the right bucket
    const monthly_trend = months.map(({ label, key }) => {
      const slice = allFees.filter((f) => f.month_year === key)
      return {
        month: label,
        collected: slice.filter((f) => f.status === 'paid').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0),
        pending: slice.filter((f) => f.status === 'pending').reduce((s, f) => s + f.amount, 0),
        overdue: slice.filter((f) => f.status === 'overdue').reduce((s, f) => s + f.amount, 0),
      }
    })

    const thisSlice = allFees.filter((f) => f.month_year === thisMonthKey)
    const lastSlice = allFees.filter((f) => f.month_year === lastMonthKey)

    function summarise(slice: typeof allFees, admissions: number) {
      return {
        collected: slice.filter((f) => f.status === 'paid').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0),
        pending: slice.filter((f) => f.status === 'pending').reduce((s, f) => s + f.amount, 0),
        overdue: slice.filter((f) => f.status === 'overdue').reduce((s, f) => s + f.amount, 0),
        new_admissions: admissions,
        admission_fees_collected: slice
          .filter((f) => f.fee_type === 'admission' && f.status === 'paid')
          .reduce((s, f) => s + (f.paid_amount ?? f.amount), 0),
      }
    }

    const this_month = summarise(thisSlice, admissionsThisResult.data?.length ?? 0)
    const last_month = summarise(lastSlice, admissionsLastResult.data?.length ?? 0)

    // Payment mode breakdown (paid fees in the 6-month window)
    const paidFees = allFees.filter((f) => f.status === 'paid')
    const payment_mode_breakdown = {
      cash: paidFees.filter((f) => f.payment_mode === 'cash').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0),
      upi: paidFees.filter((f) => f.payment_mode === 'upi').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0),
      bank_transfer: paidFees.filter((f) => f.payment_mode === 'bank_transfer').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0),
      cheque: paidFees.filter((f) => f.payment_mode === 'cheque').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0),
    }

    // Collection by course — join via batch_id
    const batchIds = [...new Set(paidFees.filter((f) => f.batch_id).map((f) => f.batch_id as string))]
    let collection_by_course: { course_name: string; collected: number; student_count: number }[] = []
    if (batchIds.length > 0) {
      const { data: batches } = await supabase
        .from('batches')
        .select('id, courses(name)')
        .in('id', batchIds)
      const batchCourseMap = new Map<string, string>()
      for (const b of batches ?? []) {
        const course = b.courses as unknown as { name: string } | null
        if (course) batchCourseMap.set(b.id, course.name)
      }
      const courseMap = new Map<string, { collected: number }>()
      for (const f of paidFees) {
        if (!f.batch_id) continue
        const courseName = batchCourseMap.get(f.batch_id) ?? 'Other'
        const entry = courseMap.get(courseName) ?? { collected: 0 }
        entry.collected += f.paid_amount ?? f.amount
        courseMap.set(courseName, entry)
      }
      const { data: enrollments } = await supabase
        .from('batch_enrollments')
        .select('student_id, batch_id')
        .in('batch_id', batchIds)
        .eq('status', 'active')
      const enrollMap = new Map<string, Set<string>>()
      for (const e of enrollments ?? []) {
        const courseName = batchCourseMap.get(e.batch_id) ?? 'Other'
        const s = enrollMap.get(courseName) ?? new Set()
        s.add(e.student_id)
        enrollMap.set(courseName, s)
      }
      collection_by_course = Array.from(courseMap.entries()).map(([course_name, { collected }]) => ({
        course_name,
        collected,
        student_count: enrollMap.get(course_name)?.size ?? 0,
      }))
    }

    // Top pending students
    const pendingFees = topPendingResult.data ?? []
    const pendingMap = new Map<string, { full_name: string; phone: string; total_pending: number; overdue_count: number }>()
    for (const f of pendingFees) {
      const student = f.students as unknown as { full_name: string; phone: string } | null
      if (!student) continue
      const entry = pendingMap.get(f.student_id) ?? { full_name: student.full_name, phone: student.phone, total_pending: 0, overdue_count: 0 }
      entry.total_pending += f.amount
      if (f.status === 'overdue') entry.overdue_count++
      pendingMap.set(f.student_id, entry)
    }
    const top_pending_students = Array.from(pendingMap.entries())
      .map(([student_id, v]) => ({ student_id, ...v }))
      .sort((a, b) => b.total_pending - a.total_pending)
      .slice(0, 10)

    res.json({
      monthly_trend,
      collection_by_course,
      payment_mode_breakdown,
      top_pending_students,
      this_month,
      last_month,
    })
  } catch (err) {
    next(err)
  }
}
