import { Router } from 'express'
import { requireAuth, requireRole } from '../../shared/auth.js'
import { createUser, deleteUser, getAllUsers, getUser, setUserStatus, inviteUser } from './controller.js'

const router = Router()

router.use(requireAuth)
router.use(requireRole(['master']))

router.post('/', createUser)
router.post('/invite', inviteUser)
router.get('/', getAllUsers)
router.get('/:id', getUser)
router.patch('/:id/status', setUserStatus)
router.delete('/:id', deleteUser)

export default router
