#!/usr/bin/env node
/**
 * Pre-deploy checklist — run before going live.
 * Usage: npm run deploy:check
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) {
    return null;
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv();
const errors = [];
const warnings = [];

if (!env) {
  errors.push('.env file not found — copy .env.example to .env');
} else {
  const isProd = env.NODE_ENV === 'production';
  const required = ['MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL', 'NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_SITE_URL'];

  for (const key of required) {
    if (!env[key]) errors.push(`Missing required variable: ${key}`);
  }

  if (isProd) {
    const insecure = (v) => !v || /change-this|changeme|dev-only/i.test(v);
    if (insecure(env.JWT_SECRET)) errors.push('JWT_SECRET must be a strong random value in production');
    if (insecure(env.ENCRYPTION_KEY)) errors.push('ENCRYPTION_KEY must be set in production (32+ random chars)');
    if (env.COOKIE_SECURE !== 'true') warnings.push('Set COOKIE_SECURE=true for HTTPS');
    if (!env.SMTP_HOST) warnings.push('SMTP_HOST not set — email OTP and notifications disabled');
    if (env.FRONTEND_URL?.startsWith('http://')) warnings.push('FRONTEND_URL should use https:// in production');
    if (!fs.existsSync(path.join(root, 'server/dist/server.js'))) {
      warnings.push('API not built — run npm run build first');
    }
    if (!fs.existsSync(path.join(root, '.next/BUILD_ID'))) {
      warnings.push('Next.js not built — run npm run build first');
    }
  }

  const uploadDir = env.UPLOAD_DIR || 'server/uploads';
  const uploadPath = path.join(root, uploadDir);
  if (!fs.existsSync(uploadPath)) {
    warnings.push(`Upload directory will be created on start: ${uploadDir}`);
  }
}

console.log('\n=== Approval Hero Deploy Check ===\n');

if (errors.length) {
  console.log('ERRORS (fix before deploy):');
  errors.forEach((e) => console.log(`  ✗ ${e}`));
}

if (warnings.length) {
  console.log('\nWARNINGS:');
  warnings.forEach((w) => console.log(`  ! ${w}`));
}

if (!errors.length && !warnings.length) {
  console.log('✓ All checks passed.\n');
} else if (!errors.length) {
  console.log('\n✓ No blocking errors. Review warnings above.\n');
} else {
  console.log('\n✗ Fix errors before deploying.\n');
  process.exit(1);
}
