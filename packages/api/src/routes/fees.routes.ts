import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { validate } from '../middleware/validate.js'
import { CreateFeeSchema, RecordPaymentSchema } from '@amuzic/shared'
import { getFees, createFee, recordPayment, generateMonthlyFees, getFeeReminders } from '../controllers/fees.controller.js'

const router: IRouter = Router()

router.get('/reminders', authenticate, requireRole('director'), getFeeReminders)
router.get('/', authenticate, requireRole('director'), getFees)
router.post('/', authenticate, requireRole('director'), validate(CreateFeeSchema), createFee)
router.patch('/:id/pay', authenticate, requireRole('director'), validate(RecordPaymentSchema), recordPayment)
router.post('/generate-monthly', authenticate, requireRole('director'), generateMonthlyFees)

export default router
