import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { validate } from '../middleware/validate.js'
import { CreateStudentSchema, UpdateStudentSchema } from '@amuzic/shared'
import {
  getStudents,
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  getStudentFees,
  getStudentProgress,
  getStudentFeeSummary,
} from '../controllers/students.controller.js'

const router: IRouter = Router()

router.get('/', authenticate, requireRole('director', 'teacher'), getStudents)
router.post('/', authenticate, requireRole('director'), validate(CreateStudentSchema), createStudent)
router.get('/:id', authenticate, requireRole('director', 'teacher'), getStudent)
router.patch('/:id', authenticate, requireRole('director'), validate(UpdateStudentSchema), updateStudent)
router.delete('/:id', authenticate, requireRole('director'), deleteStudent)
router.get('/:id/attendance', authenticate, requireRole('director', 'teacher'), getStudentAttendance)
router.get('/:id/fees', authenticate, requireRole('director', 'teacher'), getStudentFees)
router.get('/:id/progress', authenticate, requireRole('director', 'teacher'), getStudentProgress)
router.get('/:id/fee-summary', authenticate, requireRole('director', 'teacher'), getStudentFeeSummary)

export default router
