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
    const { email, full_name, phone, specializations, bio, joining_date, initial_password } = req.body as {
      email: string; full_name: string; phone: string; initial_password: string
      specializations?: string[]; bio?: string; joining_date?: string
    }

    if (!initial_password || initial_password.length < 8) {
      const err = new Error('Initial password must be at least 8 characters') as Error & { statusCode?: number }
      err.statusCode = 400
      return next(err)
    }

    // Create Supabase auth user with admin-set password; teacher must change on first login
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: initial_password,
      email_confirm: true,
      user_metadata: { full_name, role: 'teacher', must_change_password: true },
    })
    if (authError) {
      console.error('[createTeacher] auth.admin.createUser failed:', authError.message)
      const err = new Error(authError.message) as Error & { statusCode?: number; code?: string }
      err.statusCode = 400
      err.code = 'AUTH_CREATE_FAILED'
      return next(err)
    }

    const userId = authData.user.id

    // createUser may return an existing user (e.g. from a previous invite).
    // Explicitly reset password + metadata so the teacher can log in with the new password.
    const { error: updateMetaError } = await supabase.auth.admin.updateUserById(userId, {
      password: initial_password,
      user_metadata: { full_name, role: 'teacher', must_change_password: true },
    })
    if (updateMetaError) {
      console.error('[createTeacher] updateUserById failed:', updateMetaError.message)
      await supabase.auth.admin.deleteUser(userId)
      const err = new Error(`Failed to set teacher credentials: ${updateMetaError.message}`) as Error & { statusCode?: number }
      err.statusCode = 400
      return next(err)
    }

    // Upsert profile — handles both fresh create and the case where a profile already
    // exists for this auth user (previous invite flow left one behind).
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: userId, email, full_name, role: 'teacher', is_active: true })
    if (profileError) {
      console.error('[createTeacher] profiles upsert failed:', profileError.message)
      await supabase.auth.admin.deleteUser(userId)
      const err = new Error(profileError.message) as Error & { statusCode?: number }
      err.statusCode = 400
      return next(err)
    }

    // Check if a teacher record already exists for this profile (previous attempt)
    const { data: existingTeacher } = await supabase
      .from('teachers')
      .select()
      .eq('profile_id', userId)
      .maybeSingle()

    let teacherData
    if (existingTeacher) {
      const { data, error } = await supabase
        .from('teachers')
        .update({ full_name, phone, email, specializations, bio, joining_date, is_active: true, updated_at: new Date().toISOString() })
        .eq('id', existingTeacher.id)
        .select()
        .single()
      if (error) {
        console.error('[createTeacher] teachers update failed:', error.message)
        const dbErr = new Error(error.message) as Error & { statusCode?: number }
        dbErr.statusCode = 400
        return next(dbErr)
      }
      teacherData = data
    } else {
      const { data, error } = await supabase
        .from('teachers')
        .insert({ full_name, phone, email, specializations, bio, joining_date, profile_id: userId, is_active: true })
        .select()
        .single()
      if (error) {
        console.error('[createTeacher] teachers insert failed:', error.message)
        await supabase.auth.admin.deleteUser(userId)
        const dbErr = new Error(error.message) as Error & { statusCode?: number }
        dbErr.statusCode = 400
        return next(dbErr)
      }
      teacherData = data
    }

    res.status(201).json({ data: teacherData })
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

export async function getTeacherAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { date } = req.query as { date?: string }
    const targetDate = date || new Date().toISOString().split('T')[0]

    const { data: attendance, error } = await supabase
      .from('teacher_attendance')
      .select('id, teacher_id, status, notes, marked_date')
      .eq('marked_date', targetDate)

    if (error) return next(error)

    res.json(attendance || [])
  } catch (err) {
    next(err)
  }
}

export async function markTeacherAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { records, date } = req.body as { records: { teacher_id: string, status: string }[], date: string }
    const targetDate = date || new Date().toISOString().split('T')[0]

    const upserts = records.map(r => ({
      teacher_id: r.teacher_id,
      status: r.status,
      marked_date: targetDate,
      marked_by: (req as any).user?.id,
    }))

    const { error } = await supabase
      .from('teacher_attendance')
      .upsert(upserts, { onConflict: 'teacher_id,marked_date' })

    if (error) return next(error)

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
