import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { login, logout, me, changePassword } from '../controllers/auth.controller.js'

const router: IRouter = Router()

router.post('/login', login)
router.post('/change-password', authenticate, changePassword)
router.post('/logout', authenticate, logout)
router.get('/me', authenticate, me)

export default router
