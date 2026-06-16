import { createUser as createUserService, deleteUserById, getUserById, listUsers, setUserStatusById } from './service.js'

export async function createUser(req, res){
  const { 
    firstName, 
    lastName, 
    cedula, 
    cedulaType, 
    email, 
    phone, 
    emergencyPhone, 
    role,
    location,
    area 
  } = req.body

  const result = await createUserService({ 
    firstName, 
    lastName, 
    cedula, 
    cedulaType, 
    email, 
    phone, 
    emergencyPhone, 
    role,
    location,
    area 
  })

  if(!result.ok) return res.status(400).json({ error: result.error })

  // Debug log to ensure tempPassword returned
  console.log('DEBUG users.controller.createUser result keys:', Object.keys(result))

  // Return user and tempPassword explicitly to admin (tempPassword may be used once to communicate credentials)
  res.status(201).json({ user: result.user, tempPassword: result.tempPassword || null })
}

export async function getAllUsers(req, res){
  const role = req.query.role
  const users = await listUsers({ role })
  res.json(users)
}

export async function getUser(req, res){
  const user = await getUserById(req.params.id)
  if(!user) return res.status(404).json({ error: 'NOT_FOUND' })
  res.json(user)
}

export async function deleteUser(req, res){
  const ok = await deleteUserById(req.params.id)
  if(!ok) return res.status(404).json({ error: 'NOT_FOUND' })
  res.json({ ok: true })
}

export async function setUserStatus(req, res){
  const { status } = req.body || {}
  const result = await setUserStatusById(req.params.id, status)
  if(!result.ok){
    const code = result.error
    const http = code === 'NOT_FOUND' ? 404 : 400
    return res.status(http).json({ error: code })
  }
  res.json(result.user)
}
