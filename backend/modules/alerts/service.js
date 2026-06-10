import { readJson, writeJson } from '../../shared/jsonDb.js'

const ALERTS_FILE = 'alerts.json'

async function read(){
  return await readJson(ALERTS_FILE)
}
async function write(data){
  await writeJson(ALERTS_FILE, data)
}

export async function listAlerts(){
  return await read()
}

export async function markRead(id){
  const items = await read()
  const idx = items.findIndex(i => String(i.id) === String(id))
  if(idx === -1) return false
  items[idx].read = true
  await write(items)
  return true
}
