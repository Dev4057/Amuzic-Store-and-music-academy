import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'

async function triggerRevalidate(): Promise<void> {
  const webUrl = process.env['WEB_URL']
  const secret = process.env['REVALIDATE_SECRET']
  if (!webUrl || !secret) return
  await fetch(`${webUrl}/api/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
    body: JSON.stringify({ paths: ['/insights'] }),
  }).catch(() => {})
}

export async function getBlogPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { tag, limit = '10' } = req.query as Record<string, string>
    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image_url, tags, author_name, published_at, reading_time_minutes')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(parseInt(limit, 10))
    if (tag) query = query.contains('tags', [tag])
    const { data, error } = await query
    if (error) return next(error)
    res.json({ data: data ?? [] })
  } catch (err) {
    next(err)
  }
}

export async function getAllBlogPosts(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, tags, author_name, is_published, published_at, reading_time_minutes, created_at')
      .order('created_at', { ascending: false })
    if (error) return next(error)
    res.json({ data: data ?? [] })
  } catch (err) {
    next(err)
  }
}

export async function getBlogPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', req.params['slug']!)
      .eq('is_published', true)
      .single()
    if (error) return next(error)
    if (!data) { res.status(404).json({ error: { message: 'Post not found' } }); return }
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getBlogPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', req.params['id']!)
      .single()
    if (error) return next(error)
    if (!data) { res.status(404).json({ error: { message: 'Post not found' } }); return }
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function createBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const body = req.body as {
      title: string; slug: string; excerpt: string; content: string
      is_published?: boolean; published_at?: string; [key: string]: unknown
    }
    if (body.is_published && !body.published_at) {
      body.published_at = new Date().toISOString()
    }
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(body)
      .select()
      .single()
    if (error) return next(error)
    if (body.is_published) await triggerRevalidate()
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const body = req.body as { is_published?: boolean; published_at?: string; [key: string]: unknown }
    if (body.is_published && !body.published_at) {
      body.published_at = new Date().toISOString()
    }
    const { data, error } = await supabase
      .from('blog_posts')
      .update(body)
      .eq('id', req.params['id']!)
      .select()
      .single()
    if (error) return next(error)
    if (body.is_published !== undefined) await triggerRevalidate()
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function deleteBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', req.params['id']!)
    if (error) return next(error)
    await triggerRevalidate()
    res.json({ message: 'Deleted' })
  } catch (err) {
    next(err)
  }
}
