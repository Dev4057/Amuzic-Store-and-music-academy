import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { getShowcaseVideos, createShowcaseVideo, updateShowcaseVideo, deleteShowcaseVideo } from '../controllers/showcase.controller.js'

const router: IRouter = Router()

router.get('/', getShowcaseVideos)
router.post('/', authenticate, requireRole('director'), createShowcaseVideo)
router.patch('/:id', authenticate, requireRole('director'), updateShowcaseVideo)
router.delete('/:id', authenticate, requireRole('director'), deleteShowcaseVideo)

export default router
