import { readJson, writeJson } from '../../shared/jsonDb.js'

const PROFILE_FILE = 'profile.json'

async function read(){
  return await readJson(PROFILE_FILE)
}
async function write(data){
  await writeJson(PROFILE_FILE, data)
}

export async function getProfile(){
  return await read()
}

export async function updateProfile(patch){
  const { name, username, email, bio } = patch

  // Length validations
  if (name && name.length > 60) return { ok: false, error: 'NAME_TOO_LONG' }
  if (username && username.length > 25) return { ok: false, error: 'USERNAME_TOO_LONG' }
  if (email && email.length > 50) return { ok: false, error: 'EMAIL_TOO_LONG' }
  if (bio && bio.length > 50) return { ok: false, error: 'BIO_TOO_LONG' }

  const current = await read()
  const merged = { ...current, ...patch, updatedAt: new Date().toISOString() }
  await write(merged)
  return { ok: true, profile: merged }
}
