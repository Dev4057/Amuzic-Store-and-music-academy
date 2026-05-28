import { Router, type Router as IRouter } from 'express'
import authRoutes from './auth.routes.js'
import coursesRoutes from './courses.routes.js'
import studentsRoutes from './students.routes.js'
import teachersRoutes from './teachers.routes.js'
import batchesRoutes from './batches.routes.js'
import feesRoutes from './fees.routes.js'
import progressRoutes from './progress.routes.js'
import demosRoutes from './demos.routes.js'
import productsRoutes from './products.routes.js'
import ordersRoutes from './orders.routes.js'
import showcaseRoutes from './showcase.routes.js'
import dashboardRoutes from './dashboard.routes.js'
import reportsRoutes from './reports.routes.js'
import testimonialsRoutes from './testimonials.routes.js'
import blogRoutes from './blog.routes.js'
import financialsRoutes from './financials.routes.js'

const router: IRouter = Router()

router.use('/auth', authRoutes)
router.use('/courses', coursesRoutes)
router.use('/students', studentsRoutes)
router.use('/teachers', teachersRoutes)
router.use('/batches', batchesRoutes)
router.use('/fees', feesRoutes)
router.use('/progress', progressRoutes)
router.use('/demos', demosRoutes)
router.use('/products', productsRoutes)
router.use('/orders', ordersRoutes)
router.use('/showcase', showcaseRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/reports', reportsRoutes)
router.use('/testimonials', testimonialsRoutes)
router.use('/blog', blogRoutes)
router.use('/financials', financialsRoutes)

export default router
