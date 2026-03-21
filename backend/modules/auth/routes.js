import { Router } from 'express'
import { requireAuth } from '../../shared/auth.js'
import { login, me, forgot, reset, register } from './controller.js'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.post('/forgot', forgot)
router.post('/reset', reset)
router.get('/me', requireAuth, me)

export default router
