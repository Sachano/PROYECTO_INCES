import { Router } from 'express'
import { requireAuth, requireRole } from '../../shared/auth.js'
import { deleteUser, getAllUsers, getUser, setUserStatus } from './controller.js'

const router = Router()

router.use(requireAuth)
router.use(requireRole(['master']))

router.get('/', getAllUsers)
router.get('/:id', getUser)
router.patch('/:id/status', setUserStatus)
router.delete('/:id', deleteUser)

export default router
