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
