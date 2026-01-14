import bcrypt from 'bcryptjs'
import { signToken } from '../../shared/auth.js'
import { findUserForLogin, toSafeUser, updateUser } from '../users/service.js'

function normalizeIdentifier(value){
  return String(value || '').trim().toLowerCase()
}

export async function login({ identifier, password }){
  const idKey = normalizeIdentifier(identifier)
  if(!idKey) return { ok: false, error: 'MISSING_IDENTIFIER' }
  if(!password) return { ok: false, error: 'MISSING_PASSWORD' }

  const user = await findUserForLogin(idKey)
  if(!user) return { ok: false, error: 'INVALID_CREDENTIALS' }
  if(String(user.status || '').toLowerCase() !== 'active') return { ok: false, error: 'USER_INACTIVE' }

  const passOk = await bcrypt.compare(String(password), String(user.passwordHash || ''))
  if(!passOk) return { ok: false, error: 'INVALID_CREDENTIALS' }

  const now = new Date().toISOString()
  user.lastLoginAt = now
  user.updatedAt = now
  await updateUser(user)

  const safe = toSafeUser(user)
  const token = signToken({ sub: safe.id, role: safe.role, email: safe.email })

  return { ok: true, token, user: safe }
}

export async function me(auth){
  if(!auth?.sub) return null
  const user = await findUserForLogin(String(auth.email || '').trim().toLowerCase())
  return user ? toSafeUser(user) : null
}
