import { Router } from 'express'
import { getAllAlerts, markRead } from './controller.js'

const router = Router()

router.get('/', getAllAlerts)
router.post('/:id/read', markRead)

export default router
