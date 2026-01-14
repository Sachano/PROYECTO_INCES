import * as service from './service.js'

export async function getAllCourses(req, res){
  const { type, q } = req.query
  const items = await service.listCourses({ type, q })
  res.json(items)
}

export async function getCourseById(req, res){
  const id = req.params.id
  const item = await service.getCourse(id)
  if(!item) return res.status(404).json({ error: 'Course not found' })
  res.json(item)
}

export async function createCourse(req, res){
  const { title, description, longDescription, hours, tag, img, syllabusUrl } = req.body || {}
  const result = await service.createCourse({ title, description, longDescription, hours, tag, img, syllabusUrl })
  if(!result.ok) return res.status(400).json({ error: result.error })
  res.status(201).json(result.course)
}

export async function setCourseInstructor(req, res){
  const { instructorUserId } = req.body || {}
  const result = await service.setInstructor({ courseId: req.params.id, instructorUserId })
  if(!result.ok){
    const status = result.error === 'NOT_FOUND' ? 404 : 400
    return res.status(status).json({ error: result.error })
  }
  res.json(result.course)
}

export async function uploadCourseImage(req, res){
  if(!req.file) return res.status(400).json({ error: 'MISSING_FILE' })
  // Lazy import to avoid unused when route not called
  const { toImageMeta } = await import('./upload.js')
  res.json(toImageMeta(req.file))
}
