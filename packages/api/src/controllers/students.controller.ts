import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

export async function getStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { search, status, student_type, page = '1', limit = '50' } = req.query as Record<string, string>
    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)))
    const offset = (pageNum - 1) * limitNum

    // For teachers, restrict to students in their batches only
    let teacherStudentIds: string[] | null = null
    if (req.user?.role === 'teacher') {
      const { data: teacherRec } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', req.user.id)
        .single()
      if (teacherRec) {
        const { data: enrollments } = await supabase
          .from('batch_enrollments')
          .select('student_id, batches!inner(teacher_id)')
          .eq('batches.teacher_id', teacherRec.id)
          .eq('status', 'active')
        teacherStudentIds = [...new Set((enrollments ?? []).map((e) => e.student_id))]
      } else {
        teacherStudentIds = []
      }
    }

    let query = supabase.from('students').select('*', { count: 'exact' })
    if (teacherStudentIds !== null) {
      if (teacherStudentIds.length === 0) {
        res.json({ students: [], total: 0, page: pageNum }); return
      }
      query = query.in('id', teacherStudentIds)
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    if (status) query = query.eq('status', status)
    if (student_type) query = query.eq('student_type', student_type)

    const { data: students, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1)

    if (error) return next(error)

    // Fetch active batch names for each student
    const studentIds = (students ?? []).map((s) => s.id)
    const { data: enrollments } = studentIds.length
      ? await supabase
          .from('batch_enrollments')
          .select('student_id, batch_id, batches(name)')
          .in('student_id', studentIds)
          .eq('status', 'active')
      : { data: [] }

    const batchMap = new Map<string, string[]>()
    for (const e of enrollments ?? []) {
      const batches = e.batches as unknown as { name: string } | null
      if (batches) {
        const arr = batchMap.get(e.student_id) ?? []
        arr.push(batches.name)
        batchMap.set(e.student_id, arr)
      }
    }

    const enriched = (students ?? []).map((s) => ({
      ...s,
      active_batches: batchMap.get(s.id) ?? [],
    }))

    res.json({ students: enriched, total: count ?? 0, page: pageNum })
  } catch (err) {
    next(err)
  }
}

export async function createStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { send_portal_invite, batch_id, ...studentBody } = req.body as Record<string, unknown>

    let profileId: string | undefined

    if (send_portal_invite && studentBody['email']) {
      const email = studentBody['email'] as string
      const full_name = studentBody['full_name'] as string

      const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { full_name, role: 'student' },
      })
      if (authError) { next(authError); return }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: authData.user.id, email, full_name, role: 'student', is_active: true })
      if (profileError) {
        await supabase.auth.admin.deleteUser(authData.user.id)
        next(profileError); return
      }

      profileId = authData.user.id
    }

    const { data, error } = await supabase
      .from('students')
      .insert({
        ...studentBody,
        enrollment_date: new Date().toISOString().split('T')[0],
        ...(profileId ? { profile_id: profileId } : {}),
      })
      .select()
      .single()
    if (error) return next(error)

    if (batch_id && data) {
      const { error: enrollError } = await supabase
        .from('batch_enrollments')
        .insert({ batch_id, student_id: data.id, status: 'active' })
      if (enrollError) {
        console.error('[createStudent] batch enrollment failed:', enrollError.message)
      }
    }

    res.status(201).json({ data, invite_sent: !!profileId })
  } catch (err) {
    next(err)
  }
}

export async function getStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', req.params['id']!)
      .single()
    if (error) return next(error)
    if (!data) { res.status(404).json({ error: { message: 'Student not found' } }); return }

    // Fetch active enrollments with batch + course info
    const { data: enrollments } = await supabase
      .from('batch_enrollments')
      .select('*, batches(id, name, schedule_time, schedule_days, duration_minutes, course_id, courses(name, slug), teacher_id, teachers(full_name))')
      .eq('student_id', req.params['id']!)
      .eq('status', 'active')

    res.json({ data: { ...data, enrollments: enrollments ?? [] } })
  } catch (err) {
    next(err)
  }
}

export async function updateStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('students')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params['id']!)
      .select()
      .single()
    if (error) return next(error)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function deleteStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase.from('students').delete().eq('id', req.params['id']!)
    if (error) return next(error)
    res.json({ message: 'Student deleted' })
  } catch (err) {
    next(err)
  }
}

export async function getStudentAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { month } = req.query as { month?: string }

    let query = supabase
      .from('attendance')
      .select('*, batches(name)')
      .eq('student_id', req.params['id']!)
      .order('class_date', { ascending: false })

    if (month) {
      query = query.gte('class_date', `${month}-01`).lte('class_date', `${month}-31`)
    }

    const { data, error } = await query
    if (error) return next(error)

    const total = data?.length ?? 0
    const present = data?.filter((r) => r.status === 'present' || r.status === 'late').length ?? 0
    const rate = total > 0 ? Math.round((present / total) * 100) : 0

    res.json({ attendance: data ?? [], summary: { total, present, rate } })
  } catch (err) {
    next(err)
  }
}

export async function getStudentFees(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('fee_records')
      .select('*')
      .eq('student_id', req.params['id']!)
      .order('due_date', { ascending: false })
    if (error) return next(error)

    const total_paid = (data ?? []).reduce((s, r) => s + (r.paid_amount ?? 0), 0)
    const total_pending = (data ?? [])
      .filter((r) => r.status === 'pending' || r.status === 'overdue')
      .reduce((s, r) => s + r.amount, 0)

    res.json({ fees: data ?? [], summary: { total_paid, total_pending } })
  } catch (err) {
    next(err)
  }
}

export async function getStudentProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('progress_notes')
      .select('*, teachers(full_name)')
      .eq('student_id', req.params['id']!)
      .order('class_date', { ascending: false })
    if (error) return next(error)
    res.json({ notes: data ?? [] })
  } catch (err) {
    next(err)
  }
}

export async function getStudentFeeSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data: fees, error } = await supabase
      .from('fee_records')
      .select('*')
      .eq('student_id', req.params['id']!)
      .order('due_date', { ascending: false })
    if (error) return next(error)

    const thisYear = new Date().getFullYear()
    const feesThisYear = (fees ?? []).filter((f) => f.due_date?.startsWith(String(thisYear)))

    const total_billed = feesThisYear.reduce((s, f) => s + f.amount, 0)
    const total_paid = (fees ?? []).filter((f) => f.status === 'paid').reduce((s, f) => s + (f.paid_amount ?? f.amount), 0)
    const outstanding = (fees ?? []).filter((f) => f.status === 'pending' || f.status === 'overdue').reduce((s, f) => s + f.amount, 0)

    const nextDueFee = (fees ?? [])
      .filter((f) => f.status === 'pending' || f.status === 'overdue')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]

    const next_due = nextDueFee
      ? { amount: nextDueFee.amount, due_date: nextDueFee.due_date, month_year: nextDueFee.month_year ?? null }
      : null

    const payment_history = (fees ?? [])
      .filter((f) => f.status === 'paid' && f.paid_date)
      .map((f) => ({
        paid_date: f.paid_date,
        paid_amount: f.paid_amount ?? f.amount,
        payment_mode: f.payment_mode,
        fee_type: f.fee_type,
        month_year: f.month_year,
      }))
      .sort((a, b) => new Date(b.paid_date!).getTime() - new Date(a.paid_date!).getTime())

    res.json({ total_billed, total_paid, outstanding, next_due, payment_history })
  } catch (err) {
    next(err)
  }
}
