import type { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

type ValidateTarget = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: (result.error as ZodError).flatten().fieldErrors,
        },
      })
      return
    }
    req[target] = result.data
    next()
  }
}
