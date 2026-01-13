import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import coursesRouter from './modules/courses/routes.js'
import alertsRouter from './modules/alerts/routes.js'
import profileRouter from './modules/profile/routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/courses', coursesRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/profile', profileRouter)

// Serve static for any assets if needed
app.use('/public', express.static(path.join(__dirname, '..', 'public')))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
