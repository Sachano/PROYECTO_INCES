import { Router } from 'express'
import { getProfile, updateProfile, uploadAvatar } from './controller.js'
import { requireAuth } from '../../shared/auth.js'
import { uploadAvatarFile } from './upload.js'

const router = Router()

router.use(requireAuth)

router.get('/', getProfile)
router.put('/', updateProfile)
router.post('/upload-avatar', uploadAvatarFile, uploadAvatar)

export default router
