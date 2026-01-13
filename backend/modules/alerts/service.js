import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataPath = path.join(__dirname, '../../db/alerts.json')

async function read(){
  const raw = await fs.readFile(dataPath, 'utf-8')
  return JSON.parse(raw)
}
async function write(data){
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
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
