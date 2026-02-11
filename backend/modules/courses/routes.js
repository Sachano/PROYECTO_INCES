import { Router } from 'express'
import { createCourse, getAllCourses, getCourseById, setCourseInstructor, uploadCourseImage, updateCourse, deleteCourse } from './controller.js'
import { requireAuth, requireRole } from '../../shared/auth.js'
import { uploadImageFile } from './upload.js'

const router = Router()

router.use(requireAuth)

router.get('/', getAllCourses)
router.get('/:id', getCourseById)

router.post('/upload-image', requireRole(['master']), uploadImageFile, uploadCourseImage)
router.post('/', requireRole(['master']), createCourse)
router.put('/:id/instructor', requireRole(['master']), setCourseInstructor)
router.put('/:id', requireRole(['master','admin']), updateCourse)
router.delete('/:id', requireRole(['master']), deleteCourse)

export default router
