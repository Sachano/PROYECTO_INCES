import { assertCourseAccess, createPost, enrollInCourse, listAccessibleCourses, listEnrolledStudents, listPosts } from './service.js'
import { toFileMeta } from './upload.js'
import { toSubmissionFileMeta } from './submissionsUpload.js'
import { getMySubmission, listAssignmentSubmissions, upsertSubmission } from './submissionsService.js'

export async function listCourses(req, res){
  const role = String(req.auth?.role || '').toLowerCase()
  if(role === 'master') return res.status(403).json({ error: 'FORBIDDEN' })

  const courses = await listAccessibleCourses(req.auth)
  res.json(courses)
}

export async function enroll(req, res){
  const role = String(req.auth?.role || '').toLowerCase()
  if(role !== 'base') return res.status(403).json({ error: 'FORBIDDEN' })

  const result = await enrollInCourse({ courseId: req.params.courseId, userId: req.auth.sub })
  if(!result.ok){
    const status = result.error === 'COURSE_NOT_FOUND' ? 404 : 400
    return res.status(status).json({ error: result.error })
  }
  res.json({ ok: true, already: !!result.already })
}

export async function students(req, res){
  const role = String(req.auth?.role || '').toLowerCase()
  if(role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' })

  const access = await assertCourseAccess(req.auth, req.params.courseId)
  if(!access.ok) return res.status(access.error === 'COURSE_NOT_FOUND' ? 404 : 403).json({ error: access.error })

  const items = await listEnrolledStudents({ courseId: req.params.courseId })
  res.json(items)
}

export async function posts(req, res){
  const access = await assertCourseAccess(req.auth, req.params.courseId)
  if(!access.ok) return res.status(access.error === 'COURSE_NOT_FOUND' ? 404 : 403).json({ error: access.error })

  const items = await listPosts({ courseId: req.params.courseId, type: req.query.type })
  res.json(items)
}

export async function create(req, res){
  const role = String(req.auth?.role || '').toLowerCase()
  if(role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' })

  const access = await assertCourseAccess(req.auth, req.params.courseId)
  if(!access.ok) return res.status(access.error === 'COURSE_NOT_FOUND' ? 404 : 403).json({ error: access.error })

  const { type, title, description, dueAt } = req.body || {}
  const files = Array.isArray(req.files) ? req.files.map(toFileMeta) : []

  const result = await createPost({
    courseId: req.params.courseId,
    type,
    title,
    description,
    dueAt,
    createdBy: req.auth.sub,
    files
  })

  if(!result.ok) return res.status(400).json({ error: result.error })
  res.json(result.post)
}

export async function mySubmission(req, res){
  const role = String(req.auth?.role || '').toLowerCase()
  if(role !== 'base') return res.status(403).json({ error: 'FORBIDDEN' })

  const access = await assertCourseAccess(req.auth, req.params.courseId)
  if(!access.ok) return res.status(access.error === 'COURSE_NOT_FOUND' ? 404 : 403).json({ error: access.error })

  const result = await getMySubmission({
    courseId: req.params.courseId,
    assignmentId: req.params.assignmentId,
    userId: req.auth.sub,
  })

  if(!result.ok) return res.status(400).json({ error: result.error })
  res.json(result.submission)
}

export async function listSubmissions(req, res){
  const role = String(req.auth?.role || '').toLowerCase()
  if(role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' })

  const access = await assertCourseAccess(req.auth, req.params.courseId)
  if(!access.ok) return res.status(access.error === 'COURSE_NOT_FOUND' ? 404 : 403).json({ error: access.error })

  const result = await listAssignmentSubmissions({
    courseId: req.params.courseId,
    assignmentId: req.params.assignmentId,
  })

  if(!result.ok) return res.status(400).json({ error: result.error })
  res.json(result.items)
}

export async function submitSubmission(req, res){
  const role = String(req.auth?.role || '').toLowerCase()
  if(role !== 'base') return res.status(403).json({ error: 'FORBIDDEN' })

  const access = await assertCourseAccess(req.auth, req.params.courseId)
  if(!access.ok) return res.status(access.error === 'COURSE_NOT_FOUND' ? 404 : 403).json({ error: access.error })

  if(!req.file) return res.status(400).json({ error: 'MISSING_FILE' })
  const fileMeta = toSubmissionFileMeta(req.file)

  const result = await upsertSubmission({
    courseId: req.params.courseId,
    assignmentId: req.params.assignmentId,
    userId: req.auth.sub,
    fileMeta,
  })

  if(!result.ok){
    const status = result.error === 'ASSIGNMENT_NOT_FOUND' ? 404 : 400
    return res.status(status).json({ error: result.error })
  }

  res.json(result.submission)
}
