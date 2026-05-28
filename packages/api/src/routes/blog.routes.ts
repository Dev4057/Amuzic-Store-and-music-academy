import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import {
  getBlogPosts,
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../controllers/blog.controller.js'

const router: IRouter = Router()

router.get('/', getBlogPosts)
router.get('/all', authenticate, requireRole('director'), getAllBlogPosts)
router.get('/id/:id', authenticate, requireRole('director'), getBlogPostById)
router.get('/:slug', getBlogPostBySlug)
router.post('/', authenticate, requireRole('director'), createBlogPost)
router.patch('/:id', authenticate, requireRole('director'), updateBlogPost)
router.delete('/:id', authenticate, requireRole('director'), deleteBlogPost)

export default router
