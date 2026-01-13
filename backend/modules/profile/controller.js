import * as service from './service.js'

export async function getProfile(req, res){
  const p = await service.getProfile()
  res.json(p)
}

export async function updateProfile(req, res){
  const updated = await service.updateProfile(req.body || {})
  res.json(updated)
}
