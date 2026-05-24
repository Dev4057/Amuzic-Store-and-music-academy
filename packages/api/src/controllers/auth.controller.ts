import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'
import { createError } from '../middleware/errorHandler.js'

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string }
    if (!email || !password) {
      return next(createError('Email and password are required', 400, 'BAD_REQUEST'))
    }

    const supabase = createSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return next(createError(error.message, 401, 'AUTH_FAILED'))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active')
      .eq('id', data.user.id)
      .single()

    res.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      user: profile,
    })
  } catch (err) {
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.slice(7)
    if (token) {
      const supabase = createSupabaseClient()
      await supabase.auth.admin.signOut(token)
    }
    res.json({ message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
}

export function me(req: Request, res: Response): void {
  res.json({ user: req.user })
}
