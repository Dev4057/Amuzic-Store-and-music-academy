import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'
import type { CreateProductInput, UpdateProductInput } from '@amuzic/shared'

export async function getProducts(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })
    if (error) return next(error)
    res.json({ products: data ?? [] })
  } catch (err) {
    next(err)
  }
}

export async function getAllProducts(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return next(error)
    res.json({ products: data ?? [] })
  } catch (err) {
    next(err)
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', req.params.slug)
      .single()
    if (error) { res.status(404).json({ error: 'Product not found' }); return }
    res.json({ product: data })
  } catch (err) {
    next(err)
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const body = req.body as CreateProductInput
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...body,
        is_available: body.stock_quantity > 0,
        images: [],
      })
      .select()
      .single()
    if (error) return next(error)
    res.status(201).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    const updates = req.body as UpdateProductInput & { is_available?: boolean }
    // Auto-disable listing when stock hits 0
    if (updates.stock_quantity !== undefined && updates.stock_quantity <= 0) {
      updates.is_available = false
    }
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) return next(error)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}
