import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isVercel = !!process.env.VERCEL;
const isNextRuntime = !!process.env.NEXT_RUNTIME || process.env.NEXT_PHASE === 'phase-production-build';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  WEB_PORT: z.string().default('3000'),
  MONGO_URI: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(16).optional(),
  ENCRYPTION_KEY: z.string().min(16).optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().optional(),
  COOKIE_SECURE: z.string().default('false'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  NOTIFICATION_EMAIL: z.string().optional(),
  MAX_UPLOAD_SIZE_MB: z.string().default('8'),
  UPLOAD_DIR: z.string().default('server/uploads'),
  INTERNAL_API_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success && !isVercel) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.success ? parsed.data : envSchema.parse({ NODE_ENV: 'production' });
const data = {
  ...raw,
  MONGO_URI: raw.MONGO_URI || process.env.MONGO_URI || '',
  JWT_SECRET: raw.JWT_SECRET || 'dev-jwt-secret-key-minimum-32-characters',
  FRONTEND_URL:
    raw.FRONTEND_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
};
const isProd = data.NODE_ENV === 'production';
const insecureDefaults = ['change-this', 'ChangeMe', 'dev-only'];

function looksInsecure(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  return insecureDefaults.some((d) => lower.includes(d.toLowerCase()));
}

if (isProd && !isVercel && !isNextRuntime) {
  if (looksInsecure(data.JWT_SECRET)) {
    console.error('Production requires a strong JWT_SECRET (not the default placeholder).');
    process.exit(1);
  }
  if (looksInsecure(data.ENCRYPTION_KEY)) {
    console.error('Production requires ENCRYPTION_KEY — use a long random string (32+ chars).');
    process.exit(1);
  }
  if (data.COOKIE_SECURE !== 'true') {
    console.warn('[deploy] COOKIE_SECURE should be "true" when serving over HTTPS.');
  }
  if (!data.SMTP_HOST || !data.SMTP_USER) {
    console.warn('[deploy] SMTP is not configured — email OTP verification and notifications will fail.');
  }
}

export const env = {
  ...data,
  PORT: parseInt(data.PORT, 10),
  WEB_PORT: parseInt(data.WEB_PORT, 10),
  MAX_UPLOAD_SIZE_MB: parseInt(data.MAX_UPLOAD_SIZE_MB, 10),
  COOKIE_SECURE: data.COOKIE_SECURE === 'true',
  isDev: data.NODE_ENV === 'development',
  isProd,
};
