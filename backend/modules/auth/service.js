import bcrypt from 'bcryptjs'
import { signToken } from '../../shared/auth.js'
import { findUserForLogin, toSafeUser, updateUser } from '../users/service.js'
import { buildResetEmail, buildWelcomeEmail } from './emailTemplate.js'
import { normalizeIdentifier } from '../../../src/shared/utils.js'
import { generateSecurePassword, generateEnrollment, SECURITY_QUESTIONS } from '../../shared/utils.js'

export async function login({ identifier, password }){
  const idKey = normalizeIdentifier(identifier)
  if(!idKey) return { ok: false, error: 'MISSING_IDENTIFIER' }
  if(!password) return { ok: false, error: 'MISSING_PASSWORD' }

  const user = await findUserForLogin(idKey)
  console.log('[auth:login] findUserForLogin ->', user ? `${user.id || ''} ${user.uuid || ''} ${user.email}` : 'NOT_FOUND')
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

export async function forgotPassword({ email, cedula }){
  if(!email && !cedula) return { ok: false, error: 'MISSING_DATA' }
  const id = String(email || '').trim().toLowerCase()
  const ced = String(cedula || '').trim()
  // Find user by email first
  let user = null
  if(id){
    user = await findUserForLogin(id)
  }
  // If not found by email, try searching raw users by cedula
  if(!user && ced){
    const { readJson } = await import('../../shared/jsonDb.js')
    const users = await readJson('users.json')
    user = users.find(u => String(u.cedula || '').replace(/\s/g,'').toLowerCase() === ced.replace(/\s/g,'').toLowerCase())
  }

  if(!user) return { ok: true } // don't reveal whether user exists

  // generate secure token and expiry (1 hour)
  const crypto = await import('crypto')
  const token = crypto.randomBytes(24).toString('hex')
  const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString()

  // attach token to user and persist
  user.resetToken = token
  user.resetTokenExpires = expires
  await updateUser(user)

  const resetLink = `http://localhost:5173/auth/reset?token=${token}`

  // Try sending email via nodemailer (ethereal) if available; otherwise log and return resetLink for testing
  try{
    const nodemailer = await import('nodemailer')

    // prefer SMTP configuration from environment variables
    const SMTP_HOST = process.env.SMTP_HOST || ''
    const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
    const SMTP_SECURE = process.env.SMTP_SECURE === 'true'
    const SMTP_USER = process.env.SMTP_USER || ''
    const SMTP_PASS = process.env.SMTP_PASS || ''
    const EMAIL_FROM = process.env.EMAIL_FROM || 'INCES <no-reply@inces.local>'
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

      const finalResetLink = `${FRONTEND_URL.replace(/\/$/, '')}/auth/reset/${token}`

    let transporter
    if(SMTP_HOST && SMTP_USER){
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT || 587,
        secure: SMTP_SECURE || false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      })
    }else{
      // fallback to ethereal for development/testing
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
      })
    }

    // build html using reusable template
    const logoUrl = `${FRONTEND_URL.replace(/\/$/, '')}/assets/inces-logo.png`
    const userName = user.firstName || user.email || 'Usuario'
    const html = buildResetEmail({ logoUrl, resetLink: finalResetLink, userName })

    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: 'Restablecer contraseña',
      text: `Usa este enlace para restablecer tu contraseña: ${finalResetLink}`,
      html
    })

    // When using ethereal or nodemailer test account, getTestMessageUrl(info) returns a preview URL
    const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null
    console.log('Password reset email sent. Preview:', preview || finalResetLink)
    return { ok: true, resetLink: preview || finalResetLink }
  }catch(err){
    console.log('Failed to send reset email, returning resetLink for testing:', err)
    return { ok: true, resetLink }
  }
}

export async function resetPassword({ token, newPassword }){
  if(!token || !newPassword) return { ok: false, error: 'MISSING_DATA' }
  const { readJson, writeJson } = await import('../../shared/jsonDb.js')
  const users = await readJson('users.json')
  const user = users.find(u => u.resetToken === token && u.resetTokenExpires && new Date(u.resetTokenExpires) > new Date())
  if(!user) return { ok: false, error: 'INVALID_TOKEN' }
    // enforce password strength: minimum 8 chars, must include a letter and a number
    if(String(newPassword).length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)){
      return {
        ok: false,
        error: 'WEAK_PASSWORD',
        message: 'La contraseña debe tener al menos 8 caracteres e incluir letras y números.'
      }
  }

  const bcrypt = await import('bcryptjs')
  const hash = await bcrypt.hash(String(newPassword), 10)
  user.passwordHash = hash
  delete user.resetToken
  delete user.resetTokenExpires

  await writeJson('users.json', users)
  return { ok: true }
}

export async function register({ 
  firstName, 
  lastName, 
  cedulaType,
  cedula, 
  email, 
  phone, 
  emergencyPhone, 
  location, 
  area,
  securityQuestions 
}){
  // Validate required fields
  if(!firstName || !lastName || !cedula || !email || !phone || !location || !area) {
    return { ok: false, error: 'MISSING_REQUIRED_FIELDS' }
  }
  
  // Sanitize inputs to prevent SQL injection
  const sanitize = (str) => String(str).replace(/[<>\"'`;(){}\[\]|&]/g, '')
  
  const sanitizedFirstName = sanitize(firstName)
  const sanitizedLastName = sanitize(lastName)
  const sanitizedCedula = sanitize(cedula)
  const sanitizedEmail = sanitize(email)
  const sanitizedPhone = sanitize(phone)
  const sanitizedEmergencyPhone = sanitize(emergencyPhone || '')
  const sanitizedLocation = sanitize(location)
  const sanitizedArea = sanitize(area)
  
  // Validate security questions (need at least 2)
  if(!securityQuestions || !Array.isArray(securityQuestions) || securityQuestions.length < 2) {
    return { ok: false, error: 'MINIMUM_SECURITY_QUESTIONS' }
  }
  
  const { readJson, writeJson } = await import('../../shared/jsonDb.js')
  const users = await readJson('users.json')
  
  // Check if user already exists with same cedula or email
  const cedulaNormalized = String(cedula).replace(/\s/g, '').toLowerCase()
  const emailNormalized = String(email).trim().toLowerCase()
  
  const existingUser = users.find(u => 
    String(u.cedula || '').replace(/\s/g, '').toLowerCase() === cedulaNormalized ||
    String(u.email || '').trim().toLowerCase() === emailNormalized
  )
  
  if(existingUser) {
    return { ok: false, error: 'USER_ALREADY_EXISTS' }
  }
  
  // Generate password and enrollment
  const tempPassword = generateSecurePassword(12)
  const enrollment = generateEnrollment(location.toUpperCase(), area.toUpperCase())
  
  // Hash password
  const bcrypt = await import('bcryptjs')
  const passwordHash = await bcrypt.hash(tempPassword, 10)
  
  // Create new user
  const now = new Date().toISOString()
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    uuid: 'usr_' + crypto.randomUUID(),
    firstName: sanitizedFirstName.trim(),
    lastName: sanitizedLastName.trim(),
    cedulaType: cedulaType || 'V',
    cedula: sanitizedCedula.trim(),
    email: emailNormalized,
    phone: sanitizedPhone.trim(),
    emergencyPhone: sanitizedEmergencyPhone.trim(),
    role: 'base',
    status: 'active',
    passwordHash,
    enrollment,
    location: sanitizedLocation.toUpperCase(),
    area: sanitizedArea.toUpperCase(),
    securityQuestions: securityQuestions.map(sq => ({
      question: sq.question,
      answer: String(sq.answer).trim()
    })),
    avatarUrl: '',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
    notifications: [{
      id: 'n_' + Date.now(),
      title: 'Bienvenido al INCES',
      message: `Tu cuenta ha sido creada exitosamente. Tu matrícula es: ${enrollment}`,
      read: false,
      createdAt: now
    }]
  }
  
  users.push(newUser)
  await writeJson('users.json', users)
  
  // Send welcome email with credentials
  try {
    const nodemailer = await import('nodemailer')
    
    const SMTP_HOST = process.env.SMTP_HOST || ''
    const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
    const SMTP_SECURE = process.env.SMTP_SECURE === 'true'
    const SMTP_USER = process.env.SMTP_USER || ''
    const SMTP_PASS = process.env.SMTP_PASS || ''
    const EMAIL_FROM = process.env.EMAIL_FROM || 'INCES <no-reply@inces.local>'
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
    
    let transporter
    if(SMTP_HOST && SMTP_USER) {
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
      email: emailNormalized,
      password: tempPassword,
      enrollment 
    })
    
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: emailNormalized,
      subject: 'Bienvenido al INCES - Tus credenciales de acceso',
      html
    })
    
    console.log('Welcome email sent. Preview:', nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : 'N/A')
  } catch(err) {
    console.log('Failed to send welcome email:', err)
  }
  
  return { 
    ok: true, 
    message: 'Usuario creado exitosamente. Revisa tu correo para tus credenciales.',
    enrollment 
  }
}

export async function checkDuplicate({ field, value }){
  const { readJson } = await import('../../shared/jsonDb.js')
  const users = await readJson('users.json')
  
  const normalizedValue = String(value).trim().toLowerCase()
  
  const exists = users.some(user => {
    if(field === 'email'){
      return String(user.email || '').trim().toLowerCase() === normalizedValue
    }
    if(field === 'phone'){
      return String(user.phone || '').trim() === String(value).trim()
    }
    if(field === 'emergencyPhone'){
      return String(user.emergencyPhone || '').trim() === String(value).trim()
    }
    return false
  })
  
  return { exists }
}
