import { readJson, writeJson } from '../../shared/jsonDb.js'
import { normalizeIdentifier, onlyDigits } from '../../../src/shared/utils.js'
import { normalizeCedula, generateSecurePassword, generateEnrollment } from '../../shared/utils.js'
import bcrypt from 'bcryptjs'
import { invalidateActiveUserCache } from '../../shared/auth.js'

const FILE = 'users.json'

function normalizeRole(role){
  const r = String(role || '').toLowerCase()
  if(r === 'estudiante' || r === 'docente' || r === 'administrador' || r === 'master') return r
  return 'estudiante'
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
    mustChangePassword: Boolean(u.mustChangePassword),
  }
}

export async function listUsers({ role } = {}){
  const users = await readJson(FILE)
  const roleNorm = normalizeRole(role)
  const filtered = roleNorm ? users.filter(u => String(u.role).toLowerCase() === roleNorm) : users
  return filtered.map(safeUser)
}

export async function createUser(userData){
  const users = await readJson(FILE)
  const {
    firstName,
    lastName,
    cedula,
    cedulaType = 'V',
    email,
    phone,
    emergencyPhone = '',
    role = 'estudiante',
    location = '',
    area = '',
    password: userProvidedPassword,
    securityQuestions: userSecurityQuestions,
  } = userData

  // Validaciones alineadas con el flujo de registro público (robusto y consistente)
  if (!firstName || firstName.length > 50) return { ok: false, error: 'INVALID_FIRST_NAME' }
  if (!lastName || lastName.length > 50) return { ok: false, error: 'INVALID_LAST_NAME' }
  if (!cedula || cedula.length < 6 || cedula.length > 10) return { ok: false, error: 'INVALID_CEDULA' }
  if (!email || email.length > 50 || !email.includes('@')) return { ok: false, error: 'INVALID_EMAIL' }
  if (!phone || phone.length > 15) return { ok: false, error: 'INVALID_PHONE' }

  // Chequeo de duplicados ROBUSTO usando el mismo normalizador que el registro público
  const cedulaNorm = normalizeCedula(cedulaType + cedula)
  const emailNorm = String(email).trim().toLowerCase()
  const phoneNorm = String(phone).trim()

  const existing = users.find(u => {
    const uCedula = normalizeCedula((u.cedulaType || '') + u.cedula)
    return (
      u.email?.toLowerCase() === emailNorm ||
      uCedula === cedulaNorm ||
      String(u.phone || '').trim() === phoneNorm
    )
  })
  if (existing) return { ok: false, error: 'DUPLICATE_DATA' }

  const id = Math.max(...users.map(u => u.id), 0) + 1
  const uuid = `usr_${role}_${id}_${Date.now()}`
  const now = new Date().toISOString()

  // Determinar contraseña:
  // - Si el usuario proporcionó una, usarla (registro público)
  // - Si no, generar una temporal (creación por admin)
  const useProvidedPassword = Boolean(userProvidedPassword && String(userProvidedPassword).length >= 8)
  const finalPassword = useProvidedPassword ? String(userProvidedPassword) : generateSecurePassword(12)
  const passwordHash = await bcrypt.hash(finalPassword, 10)

  const enrollment = (location && area) ? generateEnrollment(String(location).toUpperCase().trim(), String(area).toUpperCase().trim()) : ''

  // Process security questions: if present, store hashed answers for safety
  let processedSecurityQuestions = []
  if (Array.isArray(userSecurityQuestions) && userSecurityQuestions.length) {
    const bcrypt = await import('bcryptjs')
    for (const sq of userSecurityQuestions) {
      const q = String(sq.question || '').trim()
      const answer = String(sq.answer || '').trim()
      if (!q || !answer) continue
      const answerHash = await bcrypt.hash(answer, 10)
      processedSecurityQuestions.push({ question: q, answerHash })
    }
  }

  const newUser = {
    id,
    uuid,
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    cedulaType: String(cedulaType).toUpperCase().trim() || 'V',
    cedula: String(cedula).trim(),
    email: emailNorm,
    phone: phoneNorm,
    emergencyPhone: String(emergencyPhone).trim(),
    role: normalizeRole(role),
    status: 'active',
    passwordHash,
    mustChangePassword: !useProvidedPassword,
    enrollment,
    location: String(location).toUpperCase().trim(),
    area: String(area).toUpperCase().trim(),
    securityQuestions: processedSecurityQuestions,
    avatarUrl: '',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
    notifications: []
  }

  users.push(newUser)
  await writeJson(FILE, users)
  invalidateActiveUserCache(newUser.id)

  // Solo enviar email de bienvenida si fue creado por admin (tiene contraseña temporal)
  if (!useProvidedPassword) {
    try {
      const nodemailer = await import('nodemailer')
      const { buildWelcomeEmail } = await import('../auth/emailTemplate.js')

      const SMTP_HOST = process.env.SMTP_HOST || ''
      const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
      const SMTP_SECURE = process.env.SMTP_SECURE === 'true'
      const SMTP_USER = process.env.SMTP_USER || ''
      const SMTP_PASS = process.env.SMTP_PASS || ''
      const EMAIL_FROM = process.env.EMAIL_FROM || 'INCES <no-reply@inces.local>'
      const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

      let transporter
      if (SMTP_HOST && SMTP_USER) {
        transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT || 587,
          secure: SMTP_SECURE || false,
          auth: { user: SMTP_USER, pass: SMTP_PASS }
        })
      } else {
        const testAccount = await nodemailer.createTestAccount()
        transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass }
        })
      }

      const logoUrl = `${FRONTEND_URL.replace(/\/$/, '')}/assets/inces-logo.png`
      const html = buildWelcomeEmail({
        logoUrl,
        userName: firstName,
        email: emailNorm,
        password: finalPassword,
        enrollment
      })

      const info = await transporter.sendMail({
        from: EMAIL_FROM,
        to: emailNorm,
        subject: 'Bienvenido al INCES - Tus credenciales de acceso',
        html
      })

      const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null
      console.log('Welcome email sent (users.create). Preview:', preview || 'N/A')
    } catch (err) {
      console.log('Failed to send welcome email (users.create):', err)
    }
  }

  return { 
    ok: true, 
    user: safeUser(newUser),
    tempPassword: useProvidedPassword ? null : finalPassword
  }
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
  const deletedId = users[idx].id
  users[idx].status = 'disabled'
  users[idx].updatedAt = now
  await writeJson(FILE, users)
  invalidateActiveUserCache(deletedId)
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
  invalidateActiveUserCache(users[idx].id)

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
    invalidateActiveUserCache(user.id)
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
