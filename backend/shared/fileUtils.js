import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Ensure directory exists
export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Validate and sanitize file extensions
export function safeExt(name, allowedExtensions) {
  const ext = path.extname(String(name || '')).toLowerCase();
  return allowedExtensions.includes(ext) ? ext : '';
}

// Generate a random ID
export function randomId() {
  return (
    Math.random().toString(16).slice(2) +
    Math.random().toString(16).slice(2)
  );
}

// Create a multer upload instance
export function createMulterUpload({ uploadDir, allowedMimeTypes, fileSizeLimit, maxFiles }) {
  ensureDir(uploadDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = safeExt(file.originalname, Object.keys(allowedMimeTypes));
      const name = `${Date.now()}_${randomId()}${ext}`;
      cb(null, name);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes[file.mimetype]) {
      return cb(null, true);
    }
    return cb(new Error('INVALID_FILE_TYPE'));
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: fileSizeLimit,
      files: maxFiles,
    },
  });
}