import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

export async function getCourses(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error) return next(error)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getCourseBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', req.params['slug'])
      .single()
    if (error) return next(error)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function createCourse(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'not implemented' })
}

export async function updateCourse(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'not implemented' })
}
