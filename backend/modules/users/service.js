import { readJson, writeJson } from '../../shared/jsonDb.js'

const FILE = 'users.json'

function normalizeRole(role){
  const r = String(role || '').toLowerCase()
  if(r === 'base' || r === 'admin' || r === 'master') return r
  return null
}

function safeUser(u){
  return {
    id: u.id,
    uuid: u.uuid,
    firstName: u.firstName,
    lastName: u.lastName,
    cedula: u.cedula,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    lastLoginAt: u.lastLoginAt,
    notifications: u.notifications || [],
    notificationsCount: Array.isArray(u.notifications) ? u.notifications.length : 0,
  }
}

export async function listUsers({ role } = {}){
  const users = await readJson(FILE)
  const roleNorm = normalizeRole(role)
  const filtered = roleNorm ? users.filter(u => String(u.role).toLowerCase() === roleNorm) : users
  return filtered.map(safeUser)
}

export async function getUserById(id){
  const users = await readJson(FILE)
  const user = users.find(u => String(u.id) === String(id) || String(u.uuid) === String(id))
  return user ? safeUser(user) : null
}

export async function deleteUserById(id){
  const users = await readJson(FILE)
  const idx = users.findIndex(u => String(u.id) === String(id) || String(u.uuid) === String(id))
  if(idx === -1) return false

  const now = new Date().toISOString()
  users[idx].status = 'disabled'
  users[idx].updatedAt = now
  await writeJson(FILE, users)
  return true
}

export async function setUserStatusById(id, status){
  const st = String(status || '').trim().toLowerCase()
  if(st !== 'active' && st !== 'disabled') return { ok: false, error: 'INVALID_STATUS' }

  const users = await readJson(FILE)
  const idx = users.findIndex(u => String(u.id) === String(id) || String(u.uuid) === String(id))
  if(idx === -1) return { ok: false, error: 'NOT_FOUND' }

  const now = new Date().toISOString()
  users[idx].status = st
  users[idx].updatedAt = now
  await writeJson(FILE, users)

  return { ok: true, user: safeUser(users[idx]) }
}

export async function findUserForLogin(identifier){
  const users = await readJson(FILE)
  const key = String(identifier || '').trim().toLowerCase()
  if(!key) return null

  const user = users.find(u => {
    const email = String(u.email || '').trim().toLowerCase()
    const cedula = String(u.cedula || '').trim().toLowerCase()
    return email === key || cedula === key
  })
  return user || null
}

export async function updateUser(user){
  const users = await readJson(FILE)
  const idx = users.findIndex(u => String(u.id) === String(user.id))
  if(idx === -1) return null
  users[idx] = user
  await writeJson(FILE, users)
  return user
}

export function toSafeUser(user){
  return safeUser(user)
}
