import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { login, logout, me } from '../controllers/auth.controller.js'

const router: IRouter = Router()

router.post('/login', login)
router.post('/logout', authenticate, logout)
router.get('/me', authenticate, me)

export default router
