import express, { type Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { generalRateLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
import routes from './routes/index.js'

const app: Application = express()

const allowedOrigins = (process.env['CORS_ORIGIN'] ?? 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((o) => o.trim())

app.use(helmet())
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())
app.use(generalRateLimiter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', routes)

app.use(errorHandler)

export default app
