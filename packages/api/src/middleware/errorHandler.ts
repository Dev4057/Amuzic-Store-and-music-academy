import type { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  code?: string
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500
  const message = statusCode < 500 ? err.message : 'Internal server error'

  res.status(statusCode).json({
    error: {
      message,
      code: err.code ?? 'INTERNAL_ERROR',
      ...(process.env['NODE_ENV'] === 'development' && statusCode >= 500
        ? { stack: err.stack }
        : {}),
    },
  })
}

export function createError(message: string, statusCode: number, code?: string): AppError {
  const err = new Error(message) as AppError
  err.statusCode = statusCode
  err.code = code
  return err
}
