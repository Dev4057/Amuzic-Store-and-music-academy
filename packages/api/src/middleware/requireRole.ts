import type { Request, Response, NextFunction } from 'express'
import type { UserRole } from '@amuzic/shared'
import { createError } from './errorHandler.js'

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createError('Authentication required', 401, 'UNAUTHORIZED'))
    }
    if (!roles.includes(req.user.role)) {
      return next(createError('Insufficient permissions', 403, 'FORBIDDEN'))
    }
    next()
  }
}
