import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { getFinancialsOverview } from '../controllers/financials.controller.js'

const router: IRouter = Router()

router.get('/overview', authenticate, requireRole('director'), getFinancialsOverview)

export default router
