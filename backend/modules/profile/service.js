import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataPath = path.join(__dirname, '../../db/profile.json')

async function read(){
  const raw = await fs.readFile(dataPath, 'utf-8')
  return JSON.parse(raw)
}
async function write(data){
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
}

export async function getProfile(){
  return await read()
}

export async function updateProfile(patch){
  const current = await read()
  const merged = { ...current, ...patch, updatedAt: new Date().toISOString() }
  await write(merged)
  return merged
}
