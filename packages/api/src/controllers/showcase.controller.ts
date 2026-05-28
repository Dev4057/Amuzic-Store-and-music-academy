import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

async function triggerRevalidate(): Promise<void> {
  const webUrl = process.env['WEB_URL']
  const secret = process.env['REVALIDATE_SECRET']
  if (!webUrl || !secret) return
  await fetch(`${webUrl}/api/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
    body: JSON.stringify({ paths: ['/showcase'] }),
  }).catch(() => {})
}

export async function getShowcaseVideos(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('showcase_videos')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
    if (error) return next(error)
    res.json({ data: data ?? [] })
  } catch (err) {
    next(err)
  }
}

export async function getAllShowcaseVideos(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('showcase_videos')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) return next(error)
    res.json({ data: data ?? [] })
  } catch (err) {
    next(err)
  }
}

export async function createShowcaseVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data: existing } = await supabase
      .from('showcase_videos')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()
    const nextOrder = (existing?.display_order ?? 0) + 1
    const { data, error } = await supabase
      .from('showcase_videos')
      .insert({ ...req.body, display_order: req.body.display_order ?? nextOrder })
      .select()
      .single()
    if (error) return next(error)
    if (req.body.is_published) await triggerRevalidate()
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateShowcaseVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('showcase_videos')
      .update(req.body)
      .eq('id', req.params['id']!)
      .select()
      .single()
    if (error) return next(error)
    if (req.body.is_published !== undefined) await triggerRevalidate()
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function deleteShowcaseVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('showcase_videos')
      .delete()
      .eq('id', req.params['id']!)
    if (error) return next(error)
    await triggerRevalidate()
    res.json({ message: 'Deleted' })
  } catch (err) {
    next(err)
  }
}
