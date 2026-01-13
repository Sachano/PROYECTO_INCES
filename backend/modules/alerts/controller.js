import * as service from './service.js'

export async function getAllAlerts(req, res){
  const items = await service.listAlerts()
  res.json(items)
}

export async function markRead(req, res){
  const id = req.params.id
  const ok = await service.markRead(id)
  if(!ok) return res.status(404).json({ error: 'Alert not found' })
  res.json({ ok: true })
}
