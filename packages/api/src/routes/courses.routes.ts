import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { getCourses, getCourseBySlug, createCourse, updateCourse } from '../controllers/courses.controller.js'

const router: IRouter = Router()

router.get('/', getCourses)
router.get('/:slug', getCourseBySlug)
router.post('/', authenticate, requireRole('director'), createCourse)
router.patch('/:id', authenticate, requireRole('director'), updateCourse)

export default router
