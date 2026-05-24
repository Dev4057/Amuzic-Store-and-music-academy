import 'dotenv/config'
import app from './app.js'

const port = parseInt(process.env['PORT'] ?? '4000', 10)

app.listen(port, () => {
  console.log(`[api] Amuzic Academy API running on http://localhost:${port}`)
})
