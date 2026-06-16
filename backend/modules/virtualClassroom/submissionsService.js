import path from 'path'
import fs from 'fs/promises'
import { readJson, writeJson } from '../../shared/jsonDb.js'

const SUBMISSIONS_FILE = 'aulaVirtualSubmissions.json'
const CLASSROOM_FILE = 'aulaVirtual.json'
const USERS_FILE = 'users.json'

function ensureArray(v){
  return Array.isArray(v) ? v : []
}

function nowIso(){
  return new Date().toISOString()
}

async function readSubmissions(){
  const db = await readJson(SUBMISSIONS_FILE)
  return { items: ensureArray(db.items) }
}

async function writeSubmissions(db){
  await writeJson(SUBMISSIONS_FILE, db)
}

async function readClassroom(){
  const db = await readJson(CLASSROOM_FILE)
  return { courses: ensureArray(db.courses) }
}

async function listUsersRaw(){
  return await readJson(USERS_FILE)
}

function parseDue(dueAt){
  if(!dueAt) return null
  const d = new Date(String(dueAt))
  if(Number.isNaN(d.getTime())) return null
  return d
}

export async function getAssignmentPost({ courseId, assignmentId }){
  const cid = Number(courseId)
  const aid = Number(assignmentId)
  const classroom = await readClassroom()
  const node = classroom.courses.find(c => Number(c.courseId) === cid)
  const posts = ensureArray(node?.posts)
  const post = posts.find(p => Number(p.id) === aid)
  if(!post) return { ok: false, error: 'ASSIGNMENT_NOT_FOUND' }
  if(String(post.type) !== 'assignment') return { ok: false, error: 'NOT_AN_ASSIGNMENT' }

  return { ok: true, assignment: post }
}

export async function upsertSubmission({ courseId, assignmentId, userId, fileMeta }){
  const cid = Number(courseId)
  const aid = Number(assignmentId)
  const uid = Number(userId)

  if(!cid || !aid || !uid) return { ok: false, error: 'INVALID_INPUT' }
  if(!fileMeta?.storedName) return { ok: false, error: 'MISSING_FILE' }

  const assignmentRes = await getAssignmentPost({ courseId: cid, assignmentId: aid })
  if(!assignmentRes.ok) return assignmentRes

  const due = parseDue(assignmentRes.assignment.dueAt)
  if(due && Date.now() > due.getTime()) return { ok: false, error: 'DEADLINE_PASSED' }

  const db = await readSubmissions()
  const existing = db.items.find(s => Number(s.courseId) === cid && Number(s.assignmentId) === aid && Number(s.userId) === uid)

  if(existing){
    const old = existing.file
    existing.file = {
      id: fileMeta.id,
      originalName: fileMeta.originalName,
      storedName: fileMeta.storedName,
      mimeType: fileMeta.mimeType,
      size: fileMeta.size,
      url: fileMeta.url,
      uploadedAt: fileMeta.uploadedAt,
    }
    existing.submittedAt = nowIso()
    await writeSubmissions(db)

    if(old?.storedName && old.storedName !== existing.file.storedName){
      await removeStoredSubmissionFiles([old])
    }

    return { ok: true, submission: existing, replaced: true }
  }

  const nextId = db.items.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1
  const submission = {
    id: nextId,
    courseId: cid,
    assignmentId: aid,
    userId: uid,
    submittedAt: nowIso(),
    file: {
      id: fileMeta.id,
      originalName: fileMeta.originalName,
      storedName: fileMeta.storedName,
      mimeType: fileMeta.mimeType,
      size: fileMeta.size,
      url: fileMeta.url,
      uploadedAt: fileMeta.uploadedAt,
    }
  }

  db.items.push(submission)
  await writeSubmissions(db)

  return { ok: true, submission }
}

export async function getMySubmission({ courseId, assignmentId, userId }){
  const cid = Number(courseId)
  const aid = Number(assignmentId)
  const uid = Number(userId)

  const db = await readSubmissions()
  const submission = db.items.find(s => Number(s.courseId) === cid && Number(s.assignmentId) === aid && Number(s.userId) === uid)
  if(!submission) return { ok: true, submission: null }
  return { ok: true, submission }
}

export async function listAssignmentSubmissions({ courseId, assignmentId }){
  const cid = Number(courseId)
  const aid = Number(assignmentId)

  const db = await readSubmissions()
  const users = await listUsersRaw()

  const userById = new Map(users.map(u => [String(u.id), u]))

  const items = db.items
    .filter(s => Number(s.courseId) === cid && Number(s.assignmentId) === aid)
    .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)))
    .map(s => {
      const u = userById.get(String(s.userId))
      return {
        id: s.id,
        userId: s.userId,
        submittedAt: s.submittedAt,
        file: s.file,
        student: u ? {
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          cedula: u.cedula,
          email: u.email,
        } : null
      }
    })

  return { ok: true, items }
}

export async function removeStoredSubmissionFiles(fileMetas){
  const list = ensureArray(fileMetas)
  const baseDir = path.join(process.cwd(), 'uploads', 'aulaVirtualSubmissions')

  for(const f of list){
    const stored = String(f?.storedName || '')
    if(!stored) continue
    const fp = path.join(baseDir, stored)
    try{ await fs.unlink(fp) }catch{ /* ignore */ }
  }
}
