import { readJson, writeJson } from '../../shared/jsonDb.js'

const COURSES_FILE = 'courses.json'
const USERS_FILE = 'users.json'

function ensureArray(v){
  return Array.isArray(v) ? v : []
}

function nowIso(){
  return new Date().toISOString()
}

function normalizeTag(tag){
  const t = String(tag || '').trim()
  if(!t) return 'Virtual'
  if(String(t).toLowerCase() === 'virtual') return 'Virtual'
  if(String(t).toLowerCase() === 'presencial') return 'Presencial'
  return t
}

function toNumberOrNull(v){
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

function safeCourseBase(c){
  return {
    id: c.id,
    title: c.title,
    author: c.author,
    hours: c.hours,
    tag: c.tag,
    description: c.description,
    longDescription: c.longDescription,
    img: c.img,
    coverImg: c.coverImg || c.img,
    syllabusUrl: c.syllabusUrl || '',
    instructorUserId: c.instructorUserId ?? null,
    instructor: c.instructor ?? null,
  }
}

function expandInstructor(course, userById){
  const out = { ...course }

  // Prefer nueva relación por id
  if(out.instructorUserId != null){
    const u = userById.get(String(out.instructorUserId))
    if(u && String(u.role).toLowerCase() === 'docente'){
      out.instructor = {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
      }
    }else{
      out.instructor = null
    }
    return out
  }

  // Compat: si el JSON viejo trae instructor objeto, lo mantenemos
  if(out.instructor && typeof out.instructor === 'object') return out

  out.instructor = null
  return out
}

async function readCourses(){
  const items = await readJson(COURSES_FILE)
  return ensureArray(items)
}

async function writeCourses(items){
  await writeJson(COURSES_FILE, items)
}

async function readUsers(){
  const items = await readJson(USERS_FILE)
  return ensureArray(items)
}

export async function listCourses({ type, q }){
  const items = await readCourses()
  const users = await readUsers()
  const userById = new Map(users.map(u => [String(u.id), u]))

  let out = items.map(safeCourseBase).map(c => expandInstructor(c, userById))
  if(type && type !== 'all') out = out.filter(i => i.tag === type)
  if(q) out = out.filter(i => i.title.toLowerCase().includes(String(q).toLowerCase()))
  return out
}

export async function getCourse(id){
  const items = await readCourses()
  const course = items.find(i => String(i.id) === String(id))
  if(!course) return null

  const users = await readUsers()
  const userById = new Map(users.map(u => [String(u.id), u]))
  return expandInstructor(safeCourseBase(course), userById)
}

export async function createCourse({ title, description, longDescription, hours, tag, img, syllabusUrl }){
  const ttl = String(title || '').trim()
  const desc = String(description || '').trim()
  const longDesc = String(longDescription || '').trim()
  const hrs = toNumberOrNull(hours)
  const t = normalizeTag(tag)
  const image = String(img || '').trim() || '/assets/course1.svg'
  const syl = String(syllabusUrl || '').trim()

  if(!ttl) return { ok: false, error: 'MISSING_TITLE' }
  if(!desc) return { ok: false, error: 'MISSING_DESCRIPTION' }
  if(!hrs) return { ok: false, error: 'MISSING_HOURS' }

  // Length validations
  if(ttl.length > 20) return { ok: false, error: 'TITLE_TOO_LONG' }
  if(desc.length > 100) return { ok: false, error: 'DESCRIPTION_TOO_LONG' }
  if(longDesc.length > 500) return { ok: false, error: 'LONG_DESCRIPTION_TOO_LONG' }
  if(hrs < 0 || hrs > 99999) return { ok: false, error: 'INVALID_HOURS' }

  const items = await readCourses()
  const nextId = items.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1
  const now = nowIso()

  const course = {
    id: nextId,
    title: ttl,
    author: 'INCES',
    hours: hrs,
    img: image,
    tag: t,
    description: desc,
    longDescription: longDesc || desc,
    instructorUserId: null,
    syllabusUrl: syl,
    createdAt: now,
    updatedAt: now,
  }

  items.push(course)
  await writeCourses(items)

  const users = await readUsers()
  const userById = new Map(users.map(u => [String(u.id), u]))
  return { ok: true, course: expandInstructor(safeCourseBase(course), userById) }
}

export async function setInstructor({ courseId, instructorUserId }){
  const items = await readCourses()
  const idx = items.findIndex(i => String(i.id) === String(courseId))
  if(idx === -1) return { ok: false, error: 'NOT_FOUND' }

  const uid = instructorUserId === null || instructorUserId === '' || typeof instructorUserId === 'undefined'
    ? null
    : Number(instructorUserId)

  if(uid != null){
    const users = await readUsers()
    const u = users.find(x => Number(x.id) === uid)
    if(!u) return { ok: false, error: 'INSTRUCTOR_NOT_FOUND' }
    if(String(u.role).toLowerCase() !== 'docente') return { ok: false, error: 'INSTRUCTOR_NOT_DOCENTE' }
    if(String(u.status).toLowerCase() !== 'active') return { ok: false, error: 'INSTRUCTOR_INACTIVE' }
  }

  items[idx].instructorUserId = uid
  items[idx].updatedAt = nowIso()
  // Si venía del JSON viejo, borramos el instructor ficticio para no confundir
  if(items[idx].instructor) delete items[idx].instructor
  if(items[idx].author) items[idx].author = 'INCES'

  await writeCourses(items)

  const users = await readUsers()
  const userById = new Map(users.map(u => [String(u.id), u]))
  return { ok: true, course: expandInstructor(safeCourseBase(items[idx]), userById) }
}

export async function updateCourse({ courseId, updates = {}, actorRole }){
  const items = await readCourses()
  const idx = items.findIndex(i => String(i.id) === String(courseId))
  if(idx === -1) return { ok: false, error: 'NOT_FOUND' }

  const allowedForMaster = new Set(['title','description','longDescription','hours','tag','img','coverImg','syllabusUrl','instructorUserId'])
  const allowedForAdmin = new Set(['instructorUserId','hours','longDescription','syllabusUrl'])
  const allowedForDocente = new Set(['longDescription','syllabusUrl'])

  const keys = Object.keys(updates || {})
  for(const k of keys){
    if(actorRole === 'master'){
      if(!allowedForMaster.has(k)) return { ok: false, error: 'FORBIDDEN_FIELD' }
    }else if(actorRole === 'administrador'){
      if(!allowedForAdmin.has(k)) return { ok: false, error: 'FORBIDDEN_FIELD' }
    }else if(actorRole === 'docente'){
      if(!allowedForDocente.has(k)) return { ok: false, error: 'FORBIDDEN_FIELD' }
    }else{
      return { ok: false, error: 'FORBIDDEN' }
    }
  }

  // Validate and apply instructor change if present
  if(Object.prototype.hasOwnProperty.call(updates, 'instructorUserId')){
    const uid = updates.instructorUserId === null || updates.instructorUserId === '' || typeof updates.instructorUserId === 'undefined'
      ? null
      : Number(updates.instructorUserId)

    if(uid != null){
      const users = await readUsers()
      const u = users.find(x => Number(x.id) === uid)
      if(!u) return { ok: false, error: 'INSTRUCTOR_NOT_FOUND' }
      if(String(u.role).toLowerCase() !== 'docente') return { ok: false, error: 'INSTRUCTOR_NOT_DOCENTE' }
      if(String(u.status).toLowerCase() !== 'active') return { ok: false, error: 'INSTRUCTOR_INACTIVE' }
    }

    items[idx].instructorUserId = uid
  }

  if(Object.prototype.hasOwnProperty.call(updates, 'hours')){
    const hrs = toNumberOrNull(updates.hours)
    if(!hrs || hrs < 0 || hrs > 99999) return { ok: false, error: 'INVALID_HOURS' }
    items[idx].hours = hrs
  }

  if(Object.prototype.hasOwnProperty.call(updates, 'title')) {
    const t = String(updates.title || '').trim()
    if(t.length > 20) return { ok: false, error: 'TITLE_TOO_LONG' }
    items[idx].title = t || items[idx].title
  }
  if(Object.prototype.hasOwnProperty.call(updates, 'description')) {
    const d = String(updates.description || '').trim()
    if(d.length > 100) return { ok: false, error: 'DESCRIPTION_TOO_LONG' }
    items[idx].description = d || items[idx].description
  }
  if(Object.prototype.hasOwnProperty.call(updates, 'longDescription')) {
    const ld = String(updates.longDescription || '').trim()
    if(ld.length > 500) return { ok: false, error: 'LONG_DESCRIPTION_TOO_LONG' }
    items[idx].longDescription = ld || items[idx].longDescription
  }
  if(Object.prototype.hasOwnProperty.call(updates, 'tag')) items[idx].tag = normalizeTag(updates.tag)
  if(Object.prototype.hasOwnProperty.call(updates, 'img')) items[idx].img = String(updates.img || '').trim() || items[idx].img
  if(Object.prototype.hasOwnProperty.call(updates, 'coverImg')) items[idx].coverImg = String(updates.coverImg || '').trim() || items[idx].coverImg
  if(Object.prototype.hasOwnProperty.call(updates, 'syllabusUrl')) items[idx].syllabusUrl = String(updates.syllabusUrl || '').trim()

  items[idx].updatedAt = nowIso()
  if(items[idx].instructor) delete items[idx].instructor
  if(items[idx].author) items[idx].author = 'INCES'

  await writeCourses(items)

  const users = await readUsers()
  const userById = new Map(users.map(u => [String(u.id), u]))
  return { ok: true, course: expandInstructor(safeCourseBase(items[idx]), userById) }
}

export async function deleteCourse(courseId){
  const items = await readCourses()
  const idx = items.findIndex(i => String(i.id) === String(courseId))
  if(idx === -1) return { ok: false, error: 'NOT_FOUND' }
  const removed = items.splice(idx, 1)[0]
  await writeCourses(items)
  return { ok: true, course: safeCourseBase(removed) }
}

export async function bulkCreateCourses({ courses, actorRole }){
  if(!Array.isArray(courses) || courses.length === 0) return { ok: false, error: 'EMPTY_BATCH' }
  if(courses.length > 50) return { ok: false, error: 'BATCH_TOO_LARGE' }
  if(actorRole !== 'master') return { ok: false, error: 'FORBIDDEN' }

  const items = await readCourses()
  let nextId = items.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1
  const now = nowIso()
  const created = []

  for(const raw of courses){
    const title = String(raw.title || '').trim()
    const description = String(raw.description || '').trim()
    const longDescription = String(raw.longDescription || '').trim()
    const hours = toNumberOrNull(raw.hours)
    const tag = normalizeTag(raw.tag)
    const image = String(raw.img || '').trim() || '/assets/course1.svg'

    if(!title) continue
    if(!description) continue
    if(!hours) continue

    const course = {
      id: nextId++,
      title,
      author: 'INCES',
      hours,
      img: image,
      tag,
      description,
      longDescription: longDescription || description,
      instructorUserId: null,
      syllabusUrl: '',
      createdAt: now,
      updatedAt: now,
    }
    items.push(course)
    created.push(course)
  }

  await writeCourses(items)
  return { ok: true, count: created.length, courses: created }
}
