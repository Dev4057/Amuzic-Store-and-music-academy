import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { validate } from '../middleware/validate.js'
import { publicRateLimiter } from '../middleware/rateLimiter.js'
import { CreateOrderSchema } from '@amuzic/shared'
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orders.controller.js'

const router: IRouter = Router()

router.post('/', publicRateLimiter, validate(CreateOrderSchema), createOrder)
router.get('/', authenticate, requireRole('director'), getOrders)
router.patch('/:id/status', authenticate, requireRole('director'), updateOrderStatus)

export default router
