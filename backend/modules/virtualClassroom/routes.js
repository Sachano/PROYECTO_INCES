import { Router } from 'express'
import { requireAuth } from '../../shared/auth.js'
import { create, enroll, listCourses, listSubmissions, mySubmission, posts, students, submitSubmission } from './controller.js'
import { uploadFiles } from './upload.js'
import { uploadSubmissionFile } from './submissionsUpload.js'

const router = Router()

router.use(requireAuth)

router.get('/courses', listCourses)
router.post('/courses/:courseId/enroll', enroll)
router.get('/courses/:courseId/students', students)
router.get('/courses/:courseId/posts', posts)
router.post('/courses/:courseId/posts', uploadFiles, create)

router.get('/courses/:courseId/assignments/:assignmentId/submissions/me', mySubmission)
router.get('/courses/:courseId/assignments/:assignmentId/submissions', listSubmissions)
router.post('/courses/:courseId/assignments/:assignmentId/submissions', uploadSubmissionFile, submitSubmission)

export default router
