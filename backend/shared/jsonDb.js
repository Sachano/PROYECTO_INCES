import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function dbPath(fileName){
  return path.join(__dirname, '..', 'db', fileName)
}

export async function readJson(fileName){
  const raw = await fs.readFile(dbPath(fileName), 'utf-8')
  return JSON.parse(raw)
}

export async function writeJson(fileName, data){
  await fs.writeFile(dbPath(fileName), JSON.stringify(data, null, 2))
}
