import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { validate } from '../middleware/validate.js'
import { publicRateLimiter } from '../middleware/rateLimiter.js'
import { CreateDemoBookingSchema } from '@amuzic/shared'
import { createDemoBooking, getDemoBookings, updateDemoStatus } from '../controllers/demos.controller.js'

const router: IRouter = Router()

router.post('/', publicRateLimiter, validate(CreateDemoBookingSchema), createDemoBooking)
router.get('/', authenticate, requireRole('director', 'teacher'), getDemoBookings)
router.patch('/:id/status', authenticate, requireRole('director'), updateDemoStatus)

export default router
