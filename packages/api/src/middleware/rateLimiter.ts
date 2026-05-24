import rateLimit from 'express-rate-limit'

export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes',
      code: 'RATE_LIMITED',
    },
  },
})

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
