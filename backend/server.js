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

// Request timeout middleware to prevent hanging requests (504 prevention)
const REQUEST_TIMEOUT = 25000 // 25 seconds
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    req.setTimeout(REQUEST_TIMEOUT, () => {
      const err = new Error('Request Timeout')
      err.status = 504
      err.statusText = 'Gateway Timeout'
      next(err)
    })
    res.setTimeout(REQUEST_TIMEOUT, () => {
      if (!res.headersSent) {
        res.status(504).json({ error: 'SERVER_TIMEOUT', message: 'El servidor tardó demasiado en responder. Intenta de nuevo.' })
      }
    })
  }
  next()
})

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

// Static files with caching for performance
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '1d',
  etag: true
}))
app.use('/public', express.static(path.join(__dirname, '..', 'public'), {
  maxAge: '1h',
  etag: true
}))

// Serve built frontend (dist/) if it exists
const distPath = path.join(__dirname, '..', 'dist')
const distIndex = path.join(distPath, 'index.html')
if (fs.existsSync(distIndex)) {
  // Assets (JS/CSS with hash in filename) can be cached long-term
  app.use('/assets', express.static(path.join(distPath, 'assets'), {
    maxAge: '1y',
    immutable: true
  }))

  // index.html NEVER cached — always serve fresh so new builds are picked up
  app.use(express.static(distPath, {
    setHeaders(res, filePath) {
      if (filePath === distIndex || filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Expires', '0')
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400')
      }
    }
  }))

  // SPA fallback: cualquier ruta no-API sirve index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(distIndex, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }, (err) => {
      if (err) next()
    })
  })
}

// Global error handler to avoid raw 500 pages and log unexpected failures
app.use((err, req, res, next) => {
  const status = err?.status || err?.statusCode || 500
  const errorCode = status === 504 ? 'SERVER_TIMEOUT' : 'SERVER_ERROR'
  const message = err?.message || (status === 504 ? 'El servidor tardó demasiado en responder. Intenta de nuevo.' : 'Internal server error')
  if (status === 504) {
    console.warn('Request timeout:', req.method, req.path)
  } else {
    console.error('Unhandled server error:', err)
  }
  if (!res.headersSent) {
    res.status(status).json({ error: errorCode, message })
  }
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

  server.timeout = 30000 // 30 seconds global timeout
  server.keepAliveTimeout = 15000
  server.headersTimeout = 35000

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
