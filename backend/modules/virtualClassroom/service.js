import path from 'path'
import fs from 'fs/promises'
import { readJson, writeJson } from '../../shared/jsonDb.js'

const ENROLLMENTS_FILE = 'enrollments.json'
const CLASSROOM_FILE = 'aulaVirtual.json'
const COURSES_FILE = 'courses.json'
const USERS_FILE = 'users.json'

function nowIso(){
  return new Date().toISOString()
}

function normalizeRole(role){
  const r = String(role || '').toLowerCase()
  if(r === 'base' || r === 'admin' || r === 'master') return r
  return null
}

function ensureArray(v){
  return Array.isArray(v) ? v : []
}

async function readEnrollments(){
  const db = await readJson(ENROLLMENTS_FILE)
  return { items: ensureArray(db.items) }
}

async function writeEnrollments(db){
  await writeJson(ENROLLMENTS_FILE, db)
}

async function readClassroom(){
  const db = await readJson(CLASSROOM_FILE)
  return { courses: ensureArray(db.courses) }
}

async function writeClassroom(db){
  await writeJson(CLASSROOM_FILE, db)
}

async function listCoursesRaw(){
  return await readJson(COURSES_FILE)
}

async function listUsersRaw(){
  return await readJson(USERS_FILE)
}

function isTeacherOfCourse(course, userEmail){
  const byId = course?.instructorUserId != null && String(course.instructorUserId) === String(arguments[2])
  if(byId) return true

  const email = String(userEmail || '').trim().toLowerCase()
  const instructorEmail = String(course?.instructor?.email || '').trim().toLowerCase()
  return !!email && email === instructorEmail
}

async function isEnrolled({ courseId, userId }){
  const cid = Number(courseId)
  const uid = Number(userId)
  const enr = await readEnrollments()
  return !!enr.items.find(e => Number(e.courseId) === cid && Number(e.userId) === uid && String(e.status) === 'enrolled')
}

export async function assertCourseAccess(auth, courseId){
  const role = normalizeRole(auth?.role)
  const courses = await listCoursesRaw()
  const course = courses.find(c => String(c.id) === String(courseId))
  if(!course) return { ok: false, error: 'COURSE_NOT_FOUND' }

  if(role === 'master') return { ok: false, error: 'FORBIDDEN' }

  if(role === 'admin'){
    if(!isTeacherOfCourse(course, { userId: auth?.sub, userEmail: auth?.email })) return { ok: false, error: 'FORBIDDEN' }
    return { ok: true, course }
  }

  // base
  const enrolled = await isEnrolled({ courseId, userId: auth?.sub })
  if(!enrolled) return { ok: false, error: 'FORBIDDEN' }
  return { ok: true, course }
}

export async function listAccessibleCourses(auth){
  const role = normalizeRole(auth?.role)
  const courses = await listCoursesRaw()

  if(role === 'master') return []

  if(role === 'admin'){
    return courses.filter(c => isTeacherOfCourse(c, { userId: auth?.sub, userEmail: auth?.email }))
  }

  // base
  const enr = await readEnrollments()
  const enrolledCourseIds = new Set(
    enr.items
      .filter(e => String(e.status) === 'enrolled' && String(e.userId) === String(auth?.sub))
      .map(e => String(e.courseId))
  )

  return courses.filter(c => enrolledCourseIds.has(String(c.id)))
}

export async function enrollInCourse({ courseId, userId }){
  const cid = Number(courseId)
  const uid = Number(userId)
  if(!cid || !uid) return { ok: false, error: 'INVALID_INPUT' }

  const courses = await listCoursesRaw()
  const course = courses.find(c => Number(c.id) === cid)
  if(!course) return { ok: false, error: 'COURSE_NOT_FOUND' }

  const db = await readEnrollments()
  const exists = db.items.find(e => Number(e.courseId) === cid && Number(e.userId) === uid && String(e.status) === 'enrolled')
  if(exists) return { ok: true, already: true }

  const nextId = db.items.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1
  db.items.push({ id: nextId, courseId: cid, userId: uid, status: 'enrolled', createdAt: nowIso() })
  await writeEnrollments(db)

  return { ok: true }
}

export async function listEnrolledStudents({ courseId }){
  const cid = Number(courseId)
  const enr = await readEnrollments()
  const users = await listUsersRaw()

  const userIds = new Set(
    enr.items
      .filter(e => Number(e.courseId) === cid && String(e.status) === 'enrolled')
      .map(e => String(e.userId))
  )

  return users
    .filter(u => userIds.has(String(u.id)))
    .map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      cedula: u.cedula,
      email: u.email,
      role: u.role,
    }))
}

function ensureCourseNode(db, courseId){
  const cid = Number(courseId)
  let node = db.courses.find(c => Number(c.courseId) === cid)
  if(!node){
    node = { courseId: cid, posts: [] }
    db.courses.push(node)
  }
  node.posts = ensureArray(node.posts)
  return node
}

export async function listPosts({ courseId, type }){
  const db = await readClassroom()
  const node = ensureCourseNode(db, courseId)
  const t = type ? String(type) : ''
  const out = t ? node.posts.filter(p => String(p.type) === t) : node.posts
  return out.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
}

function sanitizeType(type){
  const t = String(type || '').toLowerCase()
  if(t === 'content' || t === 'assignment' || t === 'grades') return t
  return null
}

export async function createPost({ courseId, type, title, description, createdBy, files, dueAt: dueAtInput }){
  const cid = Number(courseId)
  const t = sanitizeType(type)
  const ttl = String(title || '').trim()
  const desc = String(description || '').trim()
  const dueAtRaw = String(dueAtInput || '').trim()

  if(!cid || !t) return { ok: false, error: 'INVALID_TYPE' }
  if(!ttl) return { ok: false, error: 'MISSING_TITLE' }
  if(t !== 'grades' && !desc) return { ok: false, error: 'MISSING_DESCRIPTION' }

  let dueAt = null
  if(t === 'assignment'){
    if(!dueAtRaw) return { ok: false, error: 'MISSING_DUE_DATE' }
    const d = new Date(dueAtRaw)
    if(Number.isNaN(d.getTime())) return { ok: false, error: 'INVALID_DUE_DATE' }
    dueAt = d.toISOString()
  }

  const db = await readClassroom()
  const node = ensureCourseNode(db, cid)

  const nextId = node.posts.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1

  const post = {
    id: nextId,
    courseId: cid,
    type: t,
    title: ttl,
    description: desc,
    createdByUserId: Number(createdBy),
    createdAt: nowIso(),
    dueAt,
    files: ensureArray(files).map(f => ({
      id: f.id,
      originalName: f.originalName,
      storedName: f.storedName,
      mimeType: f.mimeType,
      size: f.size,
      url: f.url,
      uploadedAt: f.uploadedAt,
    }))
  }

  node.posts.push(post)
  await writeClassroom(db)

  return { ok: true, post }
}

export async function removeStoredFiles(fileMetas){
  const list = ensureArray(fileMetas)
  const baseDir = path.join(process.cwd(), 'uploads', 'aulaVirtual')

  for(const f of list){
    const stored = String(f?.storedName || '')
    if(!stored) continue
    const fp = path.join(baseDir, stored)
    try{ await fs.unlink(fp) }catch{ /* ignore */ }
  }
}
