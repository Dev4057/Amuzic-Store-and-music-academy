import { Router, type Router as IRouter } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { validate } from '../middleware/validate.js'
import { CreateProductSchema } from '@amuzic/shared'
import { getProducts, getAllProducts, getProductBySlug, createProduct, updateProduct } from '../controllers/products.controller.js'

const router: IRouter = Router()

router.get('/', getProducts)
// /all must come before /:slug to avoid route conflict
router.get('/all', authenticate, requireRole('director'), getAllProducts)
router.get('/:slug', getProductBySlug)
router.post('/', authenticate, requireRole('director'), validate(CreateProductSchema), createProduct)
router.patch('/:id', authenticate, requireRole('director'), updateProduct)

export default router
