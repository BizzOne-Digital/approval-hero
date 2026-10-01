import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import publicRoutes from './routes/publicRoutes';
import adminRoutes from './routes/adminRoutes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many verification attempts. Please try again later.' },
});

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many submission attempts. Please try again later.' },
});

const app = express();

if (env.isProd) {
  app.set('trust proxy', 1);
}

const uploadPath = path.resolve(process.cwd(), env.UPLOAD_DIR);
fs.mkdirSync(uploadPath, { recursive: true });

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts, please try again later.' },
});

app.use('/api', limiter);
app.use('/api/admin/auth/login', authLimiter);

app.use('/api/public/applications/session/send-otp', otpLimiter);
app.use('/api/public/applications/session/verify-otp', otpLimiter);
app.use('/api/public/applications/session/submit', submitLimiter);

app.use('/uploads', express.static(uploadPath, {
  maxAge: '7d',
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
}));

app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Approval Hero API is running' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
