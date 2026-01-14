import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'aulaVirtual')

function ensureDir(){
  if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv'
])

function safeExt(name){
  const ext = path.extname(String(name || '')).toLowerCase()
  if(['.pdf', '.png', '.jpg', '.jpeg', '.xlsx', '.xls', '.csv'].includes(ext)) return ext
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
  if(ALLOWED_MIME.has(file.mimetype)) return cb(null, true)
  return cb(new Error('INVALID_FILE_TYPE'))
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 12 * 1024 * 1024, // 12MB
    files: 8,
  }
})

export function uploadFiles(req, res, next){
  const handler = upload.array('files', 8)
  handler(req, res, (err) => {
    if(!err) return next()

    const code = String(err.message || err.code || '')
    if(code === 'INVALID_FILE_TYPE') return res.status(400).json({ error: 'INVALID_FILE_TYPE' })
    if(code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'FILE_TOO_LARGE' })
    if(code === 'LIMIT_FILE_COUNT') return res.status(400).json({ error: 'TOO_MANY_FILES' })
    return res.status(400).json({ error: 'UPLOAD_ERROR' })
  })
}

export function toFileMeta(file){
  return {
    id: `f_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/aulaVirtual/${file.filename}`,
    uploadedAt: new Date().toISOString(),
  }
}
