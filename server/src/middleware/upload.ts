import multer from 'multer';
import { env } from '../config/env';

const MAX_SIZE = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and WebP images are allowed'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});
