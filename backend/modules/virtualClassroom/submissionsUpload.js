import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'aulaVirtualSubmissions')

function ensureDir(){
  if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

function safeExt(name){
  const ext = path.extname(String(name || '')).toLowerCase()
  if(ext === '.pdf') return ext
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
  if(file.mimetype === 'application/pdf') return cb(null, true)
  return cb(new Error('INVALID_FILE_TYPE'))
}

export const uploadSubmission = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
    files: 1,
  }
})

export function uploadSubmissionFile(req, res, next){
  const handler = uploadSubmission.single('file')
  handler(req, res, (err) => {
    if(!err) return next()

    const code = String(err.message || err.code || '')
    if(code === 'INVALID_FILE_TYPE') return res.status(400).json({ error: 'INVALID_FILE_TYPE' })
    if(code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'FILE_TOO_LARGE' })
    return res.status(400).json({ error: 'UPLOAD_ERROR' })
  })
}

export function toSubmissionFileMeta(file){
  return {
    id: `sf_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/aulaVirtualSubmissions/${file.filename}`,
    uploadedAt: new Date().toISOString(),
  }
}
