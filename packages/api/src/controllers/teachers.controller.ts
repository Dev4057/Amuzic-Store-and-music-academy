import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

export async function getTeachers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('*')
      .order('joining_date', { ascending: true })

    if (error) return next(error)

    const teacherIds = (teachers ?? []).map((t) => t.id)

    const { data: batches } = teacherIds.length
      ? await supabase
          .from('batches')
          .select('teacher_id, id')
          .in('teacher_id', teacherIds)
          .eq('status', 'active')
      : { data: [] }

    const batchMap = new Map<string, string[]>()
    for (const b of batches ?? []) {
      if (!b.teacher_id) continue
      const arr = batchMap.get(b.teacher_id) ?? []
      arr.push(b.id)
      batchMap.set(b.teacher_id, arr)
    }

    const batchIds = (batches ?? []).map((b) => b.id)
    const { data: enrollments } = batchIds.length
      ? await supabase
          .from('batch_enrollments')
          .select('batch_id')
          .in('batch_id', batchIds)
          .eq('status', 'active')
      : { data: [] }

    const enrollCountMap = new Map<string, number>()
    for (const e of enrollments ?? []) {
      enrollCountMap.set(e.batch_id, (enrollCountMap.get(e.batch_id) ?? 0) + 1)
    }

    const enriched = (teachers ?? []).map((t) => {
      const tBatchIds = batchMap.get(t.id) ?? []
      const totalStudents = tBatchIds.reduce((s, bid) => s + (enrollCountMap.get(bid) ?? 0), 0)
      return { ...t, active_batch_count: tBatchIds.length, total_student_count: totalStudents }
    })

    res.json({ teachers: enriched })
  } catch (err) {
    next(err)
  }
}

export async function createTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('teachers')
      .insert({ ...req.body, is_active: true })
      .select()
      .single()
    if (error) return next(error)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('teachers')
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
