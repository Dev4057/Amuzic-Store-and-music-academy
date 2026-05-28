import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

export async function getTestimonials(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
    if (error) return next(error)
    res.json({ data: data ?? [] })
  } catch (err) {
    next(err)
  }
}

export async function getAllTestimonials(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) return next(error)
    res.json({ data: data ?? [] })
  } catch (err) {
    next(err)
  }
}

export async function createTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('testimonials')
      .insert(req.body)
      .select()
      .single()
    if (error) return next(error)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('testimonials')
      .update(req.body)
      .eq('id', req.params['id']!)
      .select()
      .single()
    if (error) return next(error)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function deleteTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', req.params['id']!)
    if (error) return next(error)
    res.json({ message: 'Deleted' })
  } catch (err) {
    next(err)
  }
}
