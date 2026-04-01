import { ensureDir, safeExt, randomId, createMulterUpload } from '../../shared/fileUtils.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'courses');
const ALLOWED_MIME = {
  'image/png': true,
  'image/jpeg': true,
  'image/jpg': true,
  'image/svg+xml': true,
};

const upload = createMulterUpload({
  uploadDir: UPLOAD_DIR,
  allowedMimeTypes: ALLOWED_MIME,
  fileSizeLimit: 3 * 1024 * 1024, // 3MB
  maxFiles: 1,
});

export function uploadImageFile(req, res, next) {
  const handler = upload.single('file');
  handler(req, res, (err) => {
    if (!err) return next();

    const code = String(err.message || err.code || '');
    if (code === 'INVALID_FILE_TYPE') return res.status(400).json({ error: 'INVALID_FILE_TYPE' });
    return res.status(400).json({ error: 'UPLOAD_ERROR' });
  });
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
