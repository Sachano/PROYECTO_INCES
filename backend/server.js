import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import http from 'http'
import coursesRouter from './modules/courses/routes.js'
import alertsRouter from './modules/alerts/routes.js'
import profileRouter from './modules/profile/routes.js'
import authRouter from './modules/auth/routes.js'
import usersRouter from './modules/users/routes.js'
import virtualClassroomRouter from './modules/virtualClassroom/routes.js'
import rateLimit from 'express-rate-limit'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load environment variables from backend/.env (explicit path)
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()

// Performance optimizations
app.use(cors())
// Increase JSON body limit for file uploads
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// API Routes
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Rate limiting for auth endpoints to prevent abuse
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/api/auth', authLimiter, authRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/profile', profileRouter)
app.use('/api/users', usersRouter)
app.use('/api/aula-virtual', virtualClassroomRouter)

// Resolve uploads and public directories dynamically
const uploadsPath = process.env.UPLOADS_DIR || 
  (fs.existsSync(path.join(__dirname, 'uploads')) 
    ? path.join(__dirname, 'uploads') 
    : path.join(__dirname, '..', 'uploads'))

const publicPath = process.env.PUBLIC_DIR || 
  (fs.existsSync(path.join(__dirname, 'public')) 
    ? path.join(__dirname, 'public') 
    : path.join(__dirname, '..', 'public'))

// Ensure uploads folders exist
try {
  if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true })
  const coursesDir = path.join(uploadsPath, 'courses')
  const aulaVirtualDir = path.join(uploadsPath, 'aulaVirtual')
  if (!fs.existsSync(coursesDir)) fs.mkdirSync(coursesDir, { recursive: true })
  if (!fs.existsSync(aulaVirtualDir)) fs.mkdirSync(aulaVirtualDir, { recursive: true })
} catch (err) {
  console.error('Error ensuring upload directories:', err)
}

// Static files with caching for performance
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d',
  etag: true
}))
app.use('/public', express.static(publicPath, {
  maxAge: '1h',
  etag: true
}))

// Global error handler to avoid raw 500 pages and log unexpected failures
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ error: 'SERVER_ERROR', message: err?.message || 'Internal server error' })
})

const PORT = Number(process.env.PORT) || 3001

async function isOurBackendRunning(port){
  try{
    const res = await fetch(`http://localhost:${port}/api/health`, { method: 'GET' })
    if(!res.ok) return false
    const data = await res.json().catch(() => ({}))
    return data && data.ok === true
  }catch{
    return false
  }
}

function listen(port){
  const server = http.createServer(app)

  server.on('error', (err) => {
    if(err?.code === 'EADDRINUSE'){
      ;(async () => {
        const ok = await isOurBackendRunning(port)
        if(ok){
          console.warn(`Backend ya está corriendo en http://localhost:${port} (detectado por /api/health).`)
          process.exit(0)
          return
        }
        console.error(`El puerto ${port} está ocupado por otro proceso. Cierra ese proceso o cambia PORT y el proxy de Vite.`)
        process.exit(1)
      })()
      return
    }

    console.error('Backend failed to start:', err)
    process.exit(1)
  })

  server.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`)
  })
}

listen(PORT)

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
  process.exit(1)
})
