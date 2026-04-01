import { ensureDir, safeExt, randomId, createMulterUpload } from '../../shared/fileUtils.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'aulaVirtual');
const ALLOWED_MIME = {
  'application/pdf': true,
  'image/png': true,
  'image/jpeg': true,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
  'application/vnd.ms-excel': true,
  'text/csv': true,
};

const upload = createMulterUpload({
  uploadDir: UPLOAD_DIR,
  allowedMimeTypes: ALLOWED_MIME,
  fileSizeLimit: 12 * 1024 * 1024, // 12MB
  maxFiles: 8,
});

export function uploadFiles(req, res, next) {
  const handler = upload.array('files', 8);
  handler(req, res, (err) => {
    if (!err) return next();

    const code = String(err.message || err.code || '');
    if (code === 'INVALID_FILE_TYPE') return res.status(400).json({ error: 'INVALID_FILE_TYPE' });
    if (code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'FILE_TOO_LARGE' });
    if (code === 'LIMIT_FILE_COUNT') return res.status(400).json({ error: 'TOO_MANY_FILES' });
    return res.status(400).json({ error: 'UPLOAD_ERROR' });
  });
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
