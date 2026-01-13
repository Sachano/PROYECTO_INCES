import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataPath = path.join(__dirname, '../../db/courses.json')

async function read(){
  const raw = await fs.readFile(dataPath, 'utf-8')
  return JSON.parse(raw)
}

export async function listCourses({ type, q }){
  const items = await read()
  let out = items
  if(type && type !== 'all') out = out.filter(i => i.tag === type)
  if(q) out = out.filter(i => i.title.toLowerCase().includes(String(q).toLowerCase()))
  return out
}

export async function getCourse(id){
  const items = await read()
  return items.find(i => String(i.id) === String(id))
}
