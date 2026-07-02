import jwt from 'jsonwebtoken'
import { readJson, cacheUtils } from './jsonDb.js'

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

// In-memory cache for active user status checks (avoids reading users.json on every request)
const activeUserCache = new Map()
const ACTIVE_USER_CACHE_TTL = 15000 // 15 seconds

function getCachedActiveUser(userId){
  const entry = activeUserCache.get(userId)
  if (!entry) return null
  if (Date.now() - entry.timestamp > ACTIVE_USER_CACHE_TTL){
    activeUserCache.delete(userId)
    return null
  }
  return entry.active
}

function setCachedActiveUser(userId, active){
  activeUserCache.set(userId, { active, timestamp: Date.now() })
}

export function invalidateActiveUserCache(userId){
  if (userId) {
    activeUserCache.delete(userId)
  } else {
    activeUserCache.clear()
  }
  // Also invalidate the JSON db cache for users
  cacheUtils.invalidate('users.json')
}

export async function requireAuth(req, res, next){
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if(!token) return res.status(401).json({ error: 'UNAUTHORIZED' })

  try{
    const decoded = verifyToken(token)
    req.auth = decoded

    // Check active user cache first — avoids reading users.json on every request
    const cachedActive = getCachedActiveUser(decoded.sub)
    if (cachedActive === false) {
      return res.status(401).json({ error: 'UNAUTHORIZED' })
    }
    if (cachedActive === true) {
      return next()
    }

    // Cache miss — read users.json only when necessary
    const users = await readJson('users.json')
    const user = Array.isArray(users) ? users.find(u => String(u.id) === String(decoded.sub)) : null
    const isActive = !!(user && String(user.status || '').toLowerCase() === 'active')

    setCachedActiveUser(decoded.sub, isActive)

    if (!isActive) {
      return res.status(401).json({ error: 'UNAUTHORIZED' })
    }

    return next()
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
