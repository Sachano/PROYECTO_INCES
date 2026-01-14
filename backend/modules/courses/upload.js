import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'courses')

function ensureDir(){
  if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const ALLOWED = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
])

function safeExt(name){
  const ext = path.extname(String(name || '')).toLowerCase()
  if(['.png', '.jpg', '.jpeg', '.svg'].includes(ext)) return ext
  return ''
}

function randomId(){
  return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir()
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const ext = safeExt(file.originalname)
    const name = `${Date.now()}_${randomId()}${ext}`
    cb(null, name)
  }
})

function fileFilter(req, file, cb){
  if(ALLOWED.has(file.mimetype)) return cb(null, true)
  return cb(new Error('INVALID_FILE_TYPE'))
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
    files: 1,
  }
})

export function uploadImageFile(req, res, next){
  const handler = upload.single('file')
  handler(req, res, (err) => {
    if(!err) return next()

    const code = String(err.message || err.code || '')
    if(code === 'INVALID_FILE_TYPE') return res.status(400).json({ error: 'INVALID_FILE_TYPE' })
    if(code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'FILE_TOO_LARGE' })
    return res.status(400).json({ error: 'UPLOAD_ERROR' })
  })
}

export function toImageMeta(file){
  return {
    id: `ci_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/courses/${file.filename}`,
    uploadedAt: new Date().toISOString(),
  }
}
