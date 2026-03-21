import { readJson, writeJson } from '../../shared/jsonDb.js'
import { normalizeIdentifier, onlyDigits } from '../../../src/shared/utils.js'

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
    emergencyPhone: u.emergencyPhone || '',
    role: u.role,
    status: u.status,
    enrollment: u.enrollment || '',
    location: u.location || '',
    area: u.area || '',
    securityQuestions: u.securityQuestions || [],
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
  // Also check local_users.json
  try{
    const localUsers = await readJson('local_users.json')
    if(localUsers && Array.isArray(localUsers)){
      const combined = [...users, ...localUsers]
      return findInUsers(combined, identifier)
    }
  }catch(e){ /* ignore */ }
  return findInUsers(users, identifier)
}

function findInUsers(users, identifier){
  const key = normalizeIdentifier(identifier)
  if(!key) return null
  const keyEmail = key
  const keyCedula = onlyDigits(key)

  const user = users.find(u => {
    const email = normalizeIdentifier(u.email)
    const cedulaNorm = onlyDigits(u.cedula)
    if(email && email === keyEmail) return true
    if(cedulaNorm && keyCedula && cedulaNorm === keyCedula) return true
    return false
  })

  return user || null
}

export async function updateUser(user){
  // Try updating the main users.json first
  const users = await readJson(FILE)
  const idx = users.findIndex(u => String(u.id) === String(user.id) || String(u.uuid) === String(user.uuid))
  if(idx !== -1){
    users[idx] = user
    await writeJson(FILE, users)
    return user
  }

  // If not present in main file, try local_users.json (local override)
  try{
    const localPath = 'local_users.json'
    const localUsers = await readJson(localPath)
    const lidx = localUsers.findIndex(u => String(u.id) === String(user.id) || String(u.uuid) === String(user.uuid))
    if(lidx !== -1){
      localUsers[lidx] = user
      await writeJson(localPath, localUsers)
      return user
    }
  }catch(e){ /* ignore if local file not present or write fails */ }

  return null
}

export function toSafeUser(user){
  return safeUser(user)
}
