import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import coursesRouter from './modules/courses/routes.js'
import alertsRouter from './modules/alerts/routes.js'
import profileRouter from './modules/profile/routes.js'
import authRouter from './modules/auth/routes.js'
import usersRouter from './modules/users/routes.js'
import virtualClassroomRouter from './modules/virtualClassroom/routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/profile', profileRouter)
app.use('/api/users', usersRouter)
app.use('/api/aula-virtual', virtualClassroomRouter)

// Serve static for any assets if needed
app.use('/public', express.static(path.join(__dirname, '..', 'public')))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

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
