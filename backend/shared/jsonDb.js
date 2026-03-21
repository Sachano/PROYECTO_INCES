import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// In-memory cache for JSON files (improves performance significantly)
const cache = new Map()
const CACHE_TTL = 30000 // 30 seconds TTL for cache entries

function dbPath(fileName){
  return path.join(__dirname, '..', 'db', fileName)
}

// Get cached data if valid
function getCached(fileName){
  const entry = cache.get(fileName)
  if(!entry) return null
  
  // Check if cache has expired
  if(Date.now() - entry.timestamp > CACHE_TTL){
    cache.delete(fileName)
    return null
  }
  
  // Return cached data (cloned to prevent mutations)
  return JSON.parse(JSON.stringify(entry.data))
}

// Set cache
function setCache(fileName, data){
  cache.set(fileName, {
    data,
    timestamp: Date.now()
  })
}

// Invalidate cache (call this when writing)
function invalidateCache(fileName){
  cache.delete(fileName)
}

export async function readJson(fileName){
  // Try to get from cache first
  const cached = getCached(fileName)
  if(cached) return cached
  
  const raw = await fs.readFile(dbPath(fileName), 'utf-8')
  const data = JSON.parse(raw)

  // If reading users.json, allow a local override file `local_users.json` that is
  // meant to live only on the developer machine (not committed). Merge entries
  // by `uuid` where local entries override main file entries.
  try{
    if(fileName === 'users.json'){
      const localPath = dbPath('local_users.json')
      try{
        const localRaw = await fs.readFile(localPath, 'utf-8')
        const localData = JSON.parse(localRaw)
        if(Array.isArray(data) && Array.isArray(localData)){
          const map = new Map()
          for(const u of data) map.set(String(u.uuid || u.id), u)
          for(const lu of localData) map.set(String(lu.uuid || lu.id), lu)
          const merged = Array.from(map.values())
          setCache(fileName, merged)
          return merged
        }
      }catch(e){ /* ignore missing local file */ }
    }
  }catch(e){ /* ignore overlay errors */ }

  setCache(fileName, data)
  return data
}

export async function writeJson(fileName, data){
  // Invalidate cache before writing
  invalidateCache(fileName)
  
  const dest = dbPath(fileName)
  const tmp = `${dest}.tmp`
  const payload = JSON.stringify(data, null, 2)
  // write atomically: write to tmp then rename
  await fs.writeFile(tmp, payload, 'utf-8')
  await fs.rename(tmp, dest)
}

// Export cache control for manual invalidation if needed
export const cacheUtils = {
  invalidate: invalidateCache,
  clear: () => cache.clear()
}
