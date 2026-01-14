import jwt from 'jsonwebtoken'
import { readJson } from './jsonDb.js'

const DEFAULT_SECRET = 'dev_inces_secret_change_me'

export function getJwtSecret(){
  return process.env.JWT_SECRET || DEFAULT_SECRET
}

export function signToken(payload, { expiresIn = '2h' } = {}){
  return jwt.sign(payload, getJwtSecret(), { expiresIn })
}

export function verifyToken(token){
  return jwt.verify(token, getJwtSecret())
}

export function requireAuth(req, res, next){
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if(!token) return res.status(401).json({ error: 'UNAUTHORIZED' })

  try{
    const decoded = verifyToken(token)
    req.auth = decoded

    // Bloqueo inmediato si el usuario fue deshabilitado
    Promise.resolve()
      .then(async () => {
        const users = await readJson('users.json')
        const u = Array.isArray(users) ? users.find(x => String(x.id) === String(decoded.sub)) : null
        if(!u) return res.status(401).json({ error: 'UNAUTHORIZED' })
        if(String(u.status || '').toLowerCase() !== 'active') return res.status(401).json({ error: 'UNAUTHORIZED' })
        return next()
      })
      .catch(() => res.status(401).json({ error: 'UNAUTHORIZED' }))
  }catch{
    return res.status(401).json({ error: 'UNAUTHORIZED' })
  }
}

export function requireRole(roles = []){
  const allowed = new Set(roles)
  return (req, res, next) => {
    const role = req.auth?.role
    if(!role || !allowed.has(role)) return res.status(403).json({ error: 'FORBIDDEN' })
    return next()
  }
}
