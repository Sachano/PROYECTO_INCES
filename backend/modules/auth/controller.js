import { me as meSvc, login as loginSvc, forgotPassword as forgotSvc, resetPassword as resetSvc, register as registerSvc, checkDuplicate as checkDuplicateSvc } from './service.js'

export async function login(req, res){
  const { identifier, password } = req.body || {}
  const result = await loginSvc({ identifier, password })
  if(!result.ok){
    const status = result.error === 'MISSING_IDENTIFIER' || result.error === 'MISSING_PASSWORD' ? 400 : 401
    return res.status(status).json({ error: result.error })
  }
  res.json({ token: result.token, user: result.user })
}

export async function me(req, res){
  const user = await meSvc(req.auth)
  if(!user) return res.status(401).json({ error: 'UNAUTHORIZED' })
  res.json({ user })
}

export async function forgot(req, res){
  const { email, cedula } = req.body || {}
  const result = await forgotSvc({ email, cedula })
  if(!result.ok){
    return res.status(400).json({ error: result.error })
  }
  // Return resetLink in response when present (useful for dev/testing)
  return res.json({ ok: true, resetLink: result.resetLink || null, message: 'Si existe el usuario, se envió el correo.' })
}

export async function reset(req, res){
  const { token, newPassword } = req.body || {}
  const result = await resetSvc({ token, newPassword })
  if(!result.ok){
    return res.status(400).json({ error: result.error, message: result.message || null })
  }
  return res.json({ ok: true })
}

export async function register(req, res){
  const { 
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
  } = req.body || {}
  
  const result = await registerSvc({ 
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
  })
  
  if(!result.ok){
    return res.status(400).json({ error: result.error })
  }
  
  return res.json({ 
    ok: true, 
    message: result.message,
    enrollment: result.enrollment 
  })
}

export async function checkDuplicate(req, res){
  const { field, value } = req.body || {}
  
  if(!field || !value){
    return res.status(400).json({ error: 'MISSING_DATA' })
  }
  
  const result = await checkDuplicateSvc({ field, value })
  return res.json({ exists: result.exists })
}
