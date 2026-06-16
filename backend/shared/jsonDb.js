import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import pkg from 'pg'
const { Pool } = pkg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const USE_PG = process.env.USE_PG === 'true'

let pool = null
function getPool() {
  if (pool) return pool
  const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING
  if (connectionString) {
    const isSslNeeded = connectionString.includes('sslmode=require') || connectionString.includes('neon.tech')
    pool = new Pool({
      connectionString,
      ssl: isSslNeeded ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000
    })
  } else {
    pool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: Number(process.env.PG_PORT || 5432),
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASS || '',
      database: process.env.PG_DB || 'inces',
      max: 10,
      idleTimeoutMillis: 30000
    })
  }
  return pool
}

// Ensure the json_db table exists in PostgreSQL
let tableInitialized = false
async function ensureJsonTable() {
  if (!USE_PG || tableInitialized) return
  try {
    const p = getPool()
    await p.query(`
      CREATE TABLE IF NOT EXISTS json_db (
        filename TEXT PRIMARY KEY,
        data JSONB NOT NULL
      );
    `)
    tableInitialized = true
  } catch (err) {
    console.error('Error ensuring json_db table in Postgres:', err)
  }
}

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
  
  let data = null
  if (USE_PG) {
    await ensureJsonTable()
    try {
      const p = getPool()
      const res = await p.query('SELECT data FROM json_db WHERE filename = $1', [fileName])
      if (res.rows.length > 0) {
        data = res.rows[0].data
      }
    } catch (err) {
      console.error(`Error reading ${fileName} from Postgres:`, err)
    }
  }

  // Fallback to disk if not in DB or PG is disabled
  if (data === null) {
    const raw = await fs.readFile(dbPath(fileName), 'utf-8')
    data = JSON.parse(raw)

    // Save to Postgres if using PG, so it bootstraps
    if (USE_PG) {
      try {
        const p = getPool()
        await p.query('INSERT INTO json_db (filename, data) VALUES ($1, $2) ON CONFLICT (filename) DO NOTHING', [fileName, JSON.stringify(data)])
      } catch (err) {
        console.error(`Error bootstrapping ${fileName} into Postgres:`, err)
      }
    }
  }

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
  
  if (USE_PG) {
    await ensureJsonTable()
    try {
      const p = getPool()
      await p.query(`
        INSERT INTO json_db (filename, data) 
        VALUES ($1, $2) 
        ON CONFLICT (filename) 
        DO UPDATE SET data = EXCLUDED.data
      `, [fileName, JSON.stringify(data)])
    } catch (err) {
      console.error(`Error writing ${fileName} to Postgres:`, err)
    }
  }

  try {
    const dest = dbPath(fileName)
    const tmp = `${dest}.tmp`
    const payload = JSON.stringify(data, null, 2)
    // write atomically: write to tmp then rename
    await fs.writeFile(tmp, payload, 'utf-8')
    await fs.rename(tmp, dest)
  } catch (err) {
    // If PG is enabled, writing to local disk is optional (might fail in read-only containers)
    if (!USE_PG) {
      throw err
    }
  }
}

// Export cache control for manual invalidation if needed
export const cacheUtils = {
  invalidate: invalidateCache,
  clear: () => cache.clear()
}
