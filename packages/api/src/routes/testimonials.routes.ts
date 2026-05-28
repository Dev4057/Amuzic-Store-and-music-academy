import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonials.controller.js'

const router: IRouter = Router()

router.get('/', getTestimonials)
router.get('/all', authenticate, requireRole('director'), getAllTestimonials)
router.post('/', authenticate, requireRole('director'), createTestimonial)
router.patch('/:id', authenticate, requireRole('director'), updateTestimonial)
router.delete('/:id', authenticate, requireRole('director'), deleteTestimonial)

export default router
