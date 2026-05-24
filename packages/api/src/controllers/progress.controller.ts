import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

export async function createProgressNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()

    let teacher_id: string | null = null
    if (req.user?.role === 'teacher') {
      const { data: teacherRec } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', req.user.id)
        .single()
      teacher_id = teacherRec?.id ?? null
    }

    const { note_text, student_id, batch_id, skill_level, class_date } = req.body as {
      note_text: string
      student_id: string
      batch_id?: string
      skill_level?: string
      class_date: string
    }

    const { data, error } = await supabase
      .from('progress_notes')
      .insert({
        note_text,
        student_id,
        batch_id: batch_id ?? null,
        skill_level: (skill_level ?? null) as 'beginner' | 'elementary' | 'intermediate' | 'advanced' | null,
        class_date,
        teacher_id,
      })
      .select('*, teachers(full_name)')
      .single()

    if (error) return next(error)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateProgressNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('progress_notes')
      .update({
        note_text: req.body.note_text as string,
        skill_level: req.body.skill_level as 'beginner' | 'elementary' | 'intermediate' | 'advanced' | null,
        class_date: req.body.class_date as string,
      })
      .eq('id', req.params['id']!)
      .select('*, teachers(full_name)')
      .single()
    if (error) return next(error)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}
