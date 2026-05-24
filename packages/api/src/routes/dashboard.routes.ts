import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { getDashboard } from '../controllers/dashboard.controller.js'

const router: IRouter = Router()

router.get('/', authenticate, requireRole('director'), getDashboard)

export default router
