import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { createProgressNote, updateProgressNote } from '../controllers/progress.controller.js'

const router: IRouter = Router()

router.post('/', authenticate, requireRole('director', 'teacher'), createProgressNote)
router.patch('/:id', authenticate, requireRole('director', 'teacher'), updateProgressNote)

export default router
