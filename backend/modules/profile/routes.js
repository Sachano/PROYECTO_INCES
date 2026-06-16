import { Router } from 'express'
import { getProfile, updateProfile } from './controller.js'
import { requireAuth } from '../../shared/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', getProfile)
router.put('/', updateProfile)

export default router
