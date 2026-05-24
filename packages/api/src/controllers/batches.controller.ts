import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

export async function getBatches(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { course_id, status } = req.query as Record<string, string>

    let query = supabase
      .from('batches')
      .select('*, courses(name, slug), teachers(full_name)')
      .order('created_at', { ascending: false })

    if (req.user?.role === 'teacher') {
      const { data: teacherRec } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', req.user.id)
        .single()
      if (teacherRec) {
        query = query.eq('teacher_id', teacherRec.id)
      }
    }

    if (course_id) query = query.eq('course_id', course_id)
    if (status) query = query.eq('status', status)

    const { data: batches, error } = await query
    if (error) return next(error)

    // Fetch enrollment counts
    const batchIds = (batches ?? []).map((b) => b.id)
    const { data: enrollments } = batchIds.length
      ? await supabase
          .from('batch_enrollments')
          .select('batch_id')
          .in('batch_id', batchIds)
          .eq('status', 'active')
      : { data: [] }

    const countMap = new Map<string, number>()
    for (const e of enrollments ?? []) {
      countMap.set(e.batch_id, (countMap.get(e.batch_id) ?? 0) + 1)
    }

    const enriched = (batches ?? []).map((b) => ({
      ...b,
      enrolled_count: countMap.get(b.id) ?? 0,
    }))

    res.json({ batches: enriched })
  } catch (err) {
    next(err)
  }
}

export async function createBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('batches')
      .insert({ ...req.body, status: 'active' })
      .select()
      .single()
    if (error) return next(error)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const batchId = req.params['id']!

    const [{ data: batch, error }, { data: enrollments }] = await Promise.all([
      supabase
        .from('batches')
        .select('*, courses(name, slug), teachers(full_name)')
        .eq('id', batchId)
        .single(),
      supabase
        .from('batch_enrollments')
        .select('*, students(id, full_name, phone)')
        .eq('batch_id', batchId)
        .eq('status', 'active'),
    ])

    if (error) return next(error)
    if (!batch) { res.status(404).json({ error: { message: 'Batch not found' } }); return }

    res.json({ data: { ...batch, students: enrollments ?? [] } })
  } catch (err) {
    next(err)
  }
}

export async function updateBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('batches')
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

export async function enrollStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { student_id } = req.body as { student_id: string }

    const { data, error } = await supabase
      .from('batch_enrollments')
      .upsert(
        { batch_id: req.params['id']!, student_id, status: 'active' },
        { onConflict: 'batch_id,student_id' }
      )
      .select()
      .single()

    if (error) return next(error)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function unenrollStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('batch_enrollments')
      .update({ status: 'dropped' })
      .eq('batch_id', req.params['id']!)
      .eq('student_id', req.params['studentId']!)
    if (error) return next(error)
    res.json({ message: 'Student removed from batch' })
  } catch (err) {
    next(err)
  }
}

export async function getBatchAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { date, month } = req.query as { date?: string; month?: string }
    const batchId = req.params['id']!

    let query = supabase
      .from('attendance')
      .select('*, students(full_name)')
      .eq('batch_id', batchId)

    if (date) {
      query = query.eq('class_date', date)
    } else if (month) {
      query = query.gte('class_date', `${month}-01`).lte('class_date', `${month}-31`)
    } else {
      const today = new Date().toISOString().split('T')[0]!
      query = query.eq('class_date', today)
    }

    const { data, error } = await query.order('class_date', { ascending: false })
    if (error) return next(error)
    res.json({ attendance: data ?? [] })
  } catch (err) {
    next(err)
  }
}

export async function markAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const batchId = req.params['id']!
    const { class_date, attendance } = req.body as {
      class_date: string
      attendance: Array<{ student_id: string; status: string; notes?: string }>
    }

    const records = attendance.map((a) => ({
      batch_id: batchId,
      student_id: a.student_id,
      class_date,
      status: a.status,
      notes: a.notes ?? null,
      marked_by: req.user?.id ?? null,
    }))

    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'batch_id,student_id,class_date' })
      .select()

    if (error) return next(error)
    res.json({ count: data?.length ?? 0 })
  } catch (err) {
    next(err)
  }
}
