import { Router } from 'express'
import { getAllAlerts, markRead } from './controller.js'
import { requireAuth } from '../../shared/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', getAllAlerts)
router.post('/:id/read', markRead)

export default router
