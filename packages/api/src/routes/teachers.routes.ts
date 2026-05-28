import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { getTeachers, createTeacher, updateTeacher, getTeacherAttendance, markTeacherAttendance } from '../controllers/teachers.controller.js'

const router: IRouter = Router()

router.get('/attendance', authenticate, requireRole('director'), getTeacherAttendance)
router.post('/attendance', authenticate, requireRole('director'), markTeacherAttendance)

router.get('/', authenticate, getTeachers)
router.post('/', authenticate, requireRole('director'), createTeacher)
router.patch('/:id', authenticate, requireRole('director'), updateTeacher)

export default router
