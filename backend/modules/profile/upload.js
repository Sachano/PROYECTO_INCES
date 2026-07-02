import path from 'path'
import { ensureDir, safeExt, randomId, createMulterUpload } from '../../shared/fileUtils.js'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars')
const ALLOWED_MIME = {
  'image/png': true,
  'image/jpeg': true,
  'image/jpg': true,
  'image/webp': true,
}

const upload = createMulterUpload({
  uploadDir: UPLOAD_DIR,
  allowedMimeTypes: ALLOWED_MIME,
  fileSizeLimit: 3 * 1024 * 1024,
  maxFiles: 1,
})

export function uploadAvatarFile(req, res, next) {
  const handler = upload.single('avatar')
  handler(req, res, (err) => {
    if (!err) return next()
    const code = String(err.message || err.code || '')
    if (code === 'INVALID_FILE_TYPE') return res.status(400).json({ error: 'INVALID_FILE_TYPE' })
    return res.status(400).json({ error: 'UPLOAD_ERROR' })
  })
}

export function toAvatarMeta(file) {
  return {
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/avatars/${file.filename}`,
    uploadedAt: new Date().toISOString(),
  }
}
