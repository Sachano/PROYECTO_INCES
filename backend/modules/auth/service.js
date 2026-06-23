import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { signToken } from '../../shared/auth.js'
import { findUserForLogin, toSafeUser, updateUser, createUser as createUserService } from '../users/service.js'
import { buildResetEmail, buildWelcomeEmail, buildVerificationEmail } from './emailTemplate.js'
import { normalizeIdentifier } from '../../../src/shared/utils.js'
import { generateSecurePassword, generateEnrollment, SECURITY_QUESTIONS, normalizeCedula } from '../../shared/utils.js'
import { sendEmail } from './mailer.js'

export async function login({ identifier, password }){
  if(!identifier || !password) return { ok: false, error: 'MISSING_DATA' }
  const idKey = normalizeIdentifier(String(identifier))
  if(!idKey) return { ok: false, error: 'MISSING_IDENTIFIER' }
  if(!password) return { ok: false, error: 'MISSING_PASSWORD' }

  // Sanitize: remove XSS/SQL injection characters, strip anything non-alphanumeric except @ . - _
  const sanitized = String(idKey).replace(/[<>"';&()\\]/g, '').replace(/[\x00-\x1f]/g, '').trim()
  if(!sanitized) return { ok: false, error: 'INVALID_INPUT' }
  const user = await findUserForLogin(sanitized)
  if(!user) return { ok: false, error: 'INVALID_CREDENTIALS' }
  if(String(user.status || '').toLowerCase() !== 'active') return { ok: false, error: 'USER_INACTIVE' }
  if(user.emailVerified === false) return { ok: false, error: 'EMAIL_NOT_VERIFIED' }

  const passOk = await bcrypt.compare(String(password), String(user.passwordHash || ''))
  if(!passOk) return { ok: false, error: 'INVALID_CREDENTIALS' }

  if(user.mustChangePassword){
    try{
      const crypto = await import('crypto')
      const token = crypto.randomBytes(24).toString('hex')
      const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString()
      user.resetToken = token
      user.resetTokenExpires = expires
      await updateUser(user)
      return { ok: false, error: 'MUST_CHANGE_PASSWORD', resetToken: token }
    }catch(err){
      console.error('Failed to generate reset token for mustChangePassword:', err)
      return { ok: false, error: 'MUST_CHANGE_PASSWORD' }
    }
  }

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
  let user = null
  if(id){
    user = await findUserForLogin(id)
  }
  if(!user && ced){
    const { readJson } = await import('../../shared/jsonDb.js')
    const users = await readJson('users.json')
    const searchNorm = normalizeCedula(ced)
    user = users.find(u => {
      const storedType = (u.cedulaType || '').toUpperCase()
      const storedNum = String(u.cedula || '').replace(/[^0-9]/g, '')
      const storedCombined = storedType && storedNum ? storedType + storedNum : ''
      const storedLegacy = normalizeCedula(u.cedula)
      return (storedCombined && storedCombined === searchNorm) || (storedLegacy === searchNorm)
    })
  }

  if(!user) return { ok: true }

  const crypto = await import('crypto')
  const token = crypto.randomBytes(24).toString('hex')
  const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString()

  user.resetToken = token
  user.resetTokenExpires = expires
  await updateUser(user)

  const resetLink = `http://localhost:5173/auth/reset?token=${token}`

  try{
    const nodemailer = await import('nodemailer')

    const SMTP_HOST = process.env.SMTP_HOST || ''
    const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
    const SMTP_SECURE = process.env.SMTP_SECURE === 'true'
    const SMTP_USER = process.env.SMTP_USER || ''
    const SMTP_PASS = process.env.SMTP_PASS || ''
    const EMAIL_FROM = process.env.EMAIL_FROM || 'INCES <no-reply@inces.local>'
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

    console.log('SMTP Config:', { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, hasPass: !!SMTP_PASS, EMAIL_FROM })

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
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
      })
    }

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
  securityQuestions,
  password
}){
  if(!firstName || !lastName || !cedula || !email || !phone || !location || !area) {
    return { ok: false, error: 'MISSING_REQUIRED_FIELDS' }
  }

  if(password){
    if(String(password).length < 8){
      return { ok: false, error: 'WEAK_PASSWORD' }
    }
  }

  const res = await createUserService({
    firstName,
    lastName,
    cedula,
    cedulaType,
    email,
    phone,
    emergencyPhone,
    location,
    area,
    securityQuestions,
    role: 'estudiante',
    password
  })

  if (!res.ok) return res

  // Generate email verification token and send email
  // Set user as inactive until email is verified
  try{
    const verificationToken = crypto.randomBytes(24).toString('hex')
    const { readJson, writeJson } = await import('../../shared/jsonDb.js')
    const users = await readJson('users.json')
    const idx = users.findIndex(u => String(u.id) === String(res.user.id))
    if(idx !== -1){
      users[idx].emailVerificationToken = verificationToken
      users[idx].emailVerified = false
      users[idx].status = 'inactive'
      await writeJson('users.json', users)
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
    const verifyLink = `${FRONTEND_URL.replace(/\/$/, '')}/auth/verify-email/${verificationToken}`
    const logoUrl = `${FRONTEND_URL.replace(/\/$/, '')}/assets/inces-logo.png`

    await sendEmail({
      to: email,
      subject: 'Verifica tu correo electrónico',
      html: buildVerificationEmail({ logoUrl, verifyLink, userName: firstName }),
      text: `Confirma tu correo: ${verifyLink}`
    })
  }catch(err){
    console.warn('Could not send verification email:', err)
  }

  return {
    ok: true,
    message: 'Usuario creado exitosamente. Revisa tu correo para verificar tu cuenta.',
    enrollment: res.user.enrollment
  }
}

export async function verifyEmail({ token }){
  if(!token) return { ok: false, error: 'MISSING_TOKEN' }
  const { readJson, writeJson } = await import('../../shared/jsonDb.js')
  const users = await readJson('users.json')
  const idx = users.findIndex(u => u.emailVerificationToken === token)
  if(idx === -1) return { ok: false, error: 'INVALID_TOKEN' }

  users[idx].emailVerified = true
  delete users[idx].emailVerificationToken
  if(users[idx].status === 'inactive') users[idx].status = 'active'
  await writeJson('users.json', users)
  return { ok: true }
}

export async function resendVerification({ email }){
  if(!email) return { ok: false, error: 'MISSING_EMAIL' }
  const e = String(email).trim().toLowerCase()
  const { readJson, writeJson } = await import('../../shared/jsonDb.js')
  const users = await readJson('users.json')
  const user = users.find(u => String(u.email || '').trim().toLowerCase() === e)
  if(!user) return { ok: true } // Don't reveal if email exists
  if(user.emailVerified) return { ok: false, error: 'ALREADY_VERIFIED' }

  const verificationToken = crypto.randomBytes(24).toString('hex')
  const idx = users.findIndex(u => String(u.id) === String(user.id))
  users[idx].emailVerificationToken = verificationToken
  await writeJson('users.json', users)

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
  const verifyLink = `${FRONTEND_URL.replace(/\/$/, '')}/auth/verify-email/${verificationToken}`
  const logoUrl = `${FRONTEND_URL.replace(/\/$/, '')}/assets/inces-logo.png`

  await sendEmail({
    to: email,
    subject: 'Verifica tu correo electrónico',
    html: buildVerificationEmail({ logoUrl, verifyLink, userName: user.firstName }),
    text: `Confirma tu correo: ${verifyLink}`
  })
  return { ok: true }
}

export async function createUserFromAdmin(payload){
  const {
    firstName, lastName, cedulaType, cedula, email, phone, emergencyPhone, location, area, securityQuestions, role
  } = payload

  const res = await createUserService({
    firstName, lastName, cedula, cedulaType, email, phone, emergencyPhone, role, location, area
  })

  return res
}

export async function checkDuplicate({ field, value }){
  const { readJson } = await import('../../shared/jsonDb.js')
  const users = await readJson('users.json')
  
  if (field === 'cedula') {
    const inputNorm = normalizeCedula(value)
    if (!inputNorm) return { exists: false }

    const exists = users.some(user => {
      const storedType = (user.cedulaType || '').toUpperCase()
      const storedNum = String(user.cedula || '').replace(/[^0-9]/g, '')
      const storedCombined = storedType && storedNum ? storedType + storedNum : ''
      
      const storedLegacy = normalizeCedula(user.cedula)
      
      return (storedCombined && storedCombined === inputNorm) || (storedLegacy === inputNorm)
    })
    return { exists }
  }

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