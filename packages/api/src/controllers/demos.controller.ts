import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

export async function createDemoBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('demo_bookings')
      .insert({ ...req.body, source: 'website' })
      .select()
      .single()
    if (error) return next(error)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getDemoBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { status, search, course_interest, page = '1' } = req.query as Record<string, string>
    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = 50
    const offset = (pageNum - 1) * limitNum

    let query = supabase
      .from('demo_bookings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Teachers only see demos matching their specializations
    if (req.user?.role === 'teacher') {
      const { data: teacherRec } = await supabase
        .from('teachers')
        .select('specializations')
        .eq('profile_id', req.user.id)
        .single()
      const specs: string[] = teacherRec?.specializations ?? []
      if (specs.length === 0) {
        res.json({ demos: [], total: 0 }); return
      }
      query = query.in('course_interest', specs)
    }

    if (status) query = query.eq('status', status)
    if (course_interest) query = query.eq('course_interest', course_interest)
    if (search) query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)

    const { data, count, error } = await query.range(offset, offset + limitNum - 1)
    if (error) return next(error)
    res.json({ demos: data ?? [], total: count ?? 0 })
  } catch (err) {
    next(err)
  }
}

export async function updateDemoStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { status, notes } = req.body as { status: string; notes?: string }

    const { data: existing } = await supabase
      .from('demo_bookings')
      .select('notes')
      .eq('id', req.params['id']!)
      .single()

    const existingNotes = (existing?.notes as string | null) ?? ''
    const appendedNotes = notes
      ? `${existingNotes ? existingNotes + '\n\n' : ''}[${new Date().toLocaleString('en-IN')}] ${notes}`
      : existingNotes || null

    const { data, error } = await supabase
      .from('demo_bookings')
      .update({ status, notes: appendedNotes })
      .eq('id', req.params['id']!)
      .select()
      .single()

    if (error) return next(error)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}
