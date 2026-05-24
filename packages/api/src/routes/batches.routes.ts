import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { validate } from '../middleware/validate.js'
import { CreateBatchSchema, MarkAttendanceSchema } from '@amuzic/shared'
import {
  getBatches,
  createBatch,
  getBatch,
  updateBatch,
  enrollStudent,
  unenrollStudent,
  getBatchAttendance,
  markAttendance,
} from '../controllers/batches.controller.js'

const router: IRouter = Router()

router.get('/', authenticate, requireRole('director', 'teacher'), getBatches)
router.post('/', authenticate, requireRole('director'), validate(CreateBatchSchema), createBatch)
router.get('/:id', authenticate, requireRole('director', 'teacher'), getBatch)
router.patch('/:id', authenticate, requireRole('director'), updateBatch)
router.post('/:id/enroll', authenticate, requireRole('director', 'teacher'), enrollStudent)
router.delete('/:id/enroll/:studentId', authenticate, requireRole('director', 'teacher'), unenrollStudent)
router.get('/:id/attendance', authenticate, requireRole('director', 'teacher'), getBatchAttendance)
router.post('/:id/attendance', authenticate, requireRole('director', 'teacher'), validate(MarkAttendanceSchema), markAttendance)

export default router
