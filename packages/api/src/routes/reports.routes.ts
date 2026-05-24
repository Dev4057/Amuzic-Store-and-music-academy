import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { getReports } from '../controllers/reports.controller.js'

const router: IRouter = Router()

router.get('/', authenticate, requireRole('director'), getReports)

export default router
