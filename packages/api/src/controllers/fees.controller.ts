import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

export async function getFees(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { student_id, status, month_year, search, page = '1' } = req.query as Record<string, string>
    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = 50
    const offset = (pageNum - 1) * limitNum

    let query = supabase
      .from('fee_records')
      .select('*, students(full_name, phone)', { count: 'exact' })

    if (student_id) query = query.eq('student_id', student_id)
    if (status) query = query.eq('status', status)
    if (month_year) query = query.eq('month_year', month_year)
    if (search) {
      const { data: matchedStudents } = await supabase
        .from('students')
        .select('id')
        .ilike('full_name', `%${search}%`)
      const ids = (matchedStudents ?? []).map((s) => s.id)
      if (ids.length > 0) query = query.in('student_id', ids)
      else { res.json({ fees: [], total: 0, summary: { pending_count: 0, overdue_count: 0, pending_amount: 0, overdue_amount: 0, collected_this_month: 0 } }); return }
    }

    const { data: fees, count, error } = await query
      .order('due_date', { ascending: false })
      .range(offset, offset + limitNum - 1)

    if (error) return next(error)

    // Summary counts (all, not paginated)
    const { data: allPending } = await supabase
      .from('fee_records')
      .select('amount, status')
      .in('status', ['pending', 'overdue'])

    const monthStart = new Date().toISOString().slice(0, 7) + '-01'
    const { data: collectedThisMonth } = await supabase
      .from('fee_records')
      .select('paid_amount')
      .eq('status', 'paid')
      .gte('paid_date', monthStart)

    const pending_count = (allPending ?? []).filter((r) => r.status === 'pending').length
    const overdue_count = (allPending ?? []).filter((r) => r.status === 'overdue').length
    const pending_amount = (allPending ?? []).filter((r) => r.status === 'pending').reduce((s, r) => s + r.amount, 0)
    const overdue_amount = (allPending ?? []).filter((r) => r.status === 'overdue').reduce((s, r) => s + r.amount, 0)
    const collected_this_month = (collectedThisMonth ?? []).reduce((s, r) => s + (r.paid_amount ?? 0), 0)

    res.json({
      fees: fees ?? [],
      total: count ?? 0,
      summary: { pending_count, overdue_count, pending_amount, overdue_amount, collected_this_month },
    })
  } catch (err) {
    next(err)
  }
}

export async function createFee(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('fee_records')
      .insert({ ...req.body, status: 'pending' })
      .select()
      .single()
    if (error) return next(error)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function recordPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { paid_amount, paid_date, payment_mode, notes } = req.body as {
      paid_amount: number
      paid_date: string
      payment_mode: string
      notes?: string
    }

    const { data: existing } = await supabase
      .from('fee_records')
      .select('amount')
      .eq('id', req.params['id']!)
      .single()

    const status = existing && paid_amount >= existing.amount ? 'paid' : 'pending'

    const { data, error } = await supabase
      .from('fee_records')
      .update({
        paid_amount,
        paid_date,
        payment_mode,
        notes: notes ?? null,
        status,
        collected_by: req.user?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params['id']!)
      .select()
      .single()

    if (error) return next(error)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function generateMonthlyFees(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { month_year, due_date } = req.body as { month_year: string; due_date: string }

    // Find all active students with active batch enrollments
    const { data: enrollments, error: enrollError } = await supabase
      .from('batch_enrollments')
      .select('student_id, batch_id, batches(course_id, courses(monthly_fee))')
      .eq('status', 'active')

    if (enrollError) return next(enrollError)

    // Check existing fees for this month
    const studentIds = [...new Set((enrollments ?? []).map((e) => e.student_id))]
    const { data: existing } = await supabase
      .from('fee_records')
      .select('student_id')
      .eq('month_year', month_year)
      .eq('fee_type', 'monthly')
      .in('student_id', studentIds)

    const alreadyHasFee = new Set((existing ?? []).map((r) => r.student_id))

    const toInsert = (enrollments ?? [])
      .filter((e) => !alreadyHasFee.has(e.student_id))
      .map((e) => {
        const batches = e.batches as unknown as { course_id: string; courses: { monthly_fee: number | null } | null } | null
        const monthly_fee = batches?.courses?.monthly_fee ?? 1500
        return {
          student_id: e.student_id,
          batch_id: e.batch_id,
          fee_type: 'monthly' as const,
          amount: monthly_fee,
          due_date,
          month_year,
          status: 'pending' as const,
        }
      })

    // Deduplicate by student_id (take first enrollment if multiple)
    const seen = new Set<string>()
    const deduped = toInsert.filter((r) => {
      if (seen.has(r.student_id)) return false
      seen.add(r.student_id)
      return true
    })

    if (deduped.length > 0) {
      const { error: insertError } = await supabase.from('fee_records').insert(deduped)
      if (insertError) return next(insertError)
    }

    res.json({ created: deduped.length, skipped: studentIds.length - deduped.length })
  } catch (err) {
    next(err)
  }
}
