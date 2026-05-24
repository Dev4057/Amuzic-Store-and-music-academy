import type { Request, Response, NextFunction } from 'express'
import { createSupabaseClient } from '@amuzic/db'
import type { UserRole } from '@amuzic/shared'
import { createError } from './errorHandler.js'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return next(createError('Missing or invalid authorization header', 401, 'UNAUTHORIZED'))
    }

    const token = authHeader.slice(7)
    const supabase = createSupabaseClient()

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return next(createError('Invalid or expired token', 401, 'UNAUTHORIZED'))
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return next(createError('User profile not found', 401, 'UNAUTHORIZED'))
    }

    if (!profile.is_active) {
      return next(createError('Account is deactivated', 403, 'FORBIDDEN'))
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole,
      full_name: profile.full_name,
    }

    next()
  } catch (err) {
    next(err)
  }
}
