import * as service from './service.js'
import { toAvatarMeta } from './upload.js'

export async function getProfile(req, res){
  const p = await service.getProfile()
  res.json(p)
}

export async function updateProfile(req, res){
  const updated = await service.updateProfile(req.body || {})
  res.json(updated)
}

export async function uploadAvatar(req, res){
  if (!req.file) return res.status(400).json({ error: 'NO_FILE' })
  const meta = toAvatarMeta(req.file)
  const updated = await service.updateProfile({ avatarUrl: meta.url })
  res.json({ ok: true, avatarUrl: meta.url, ...updated })
}
