import { me as meSvc, login as loginSvc } from './service.js'

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
