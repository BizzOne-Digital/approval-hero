import crypto from 'crypto';
import { env } from '../config/env';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'dev-only-key-change-in-production';
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptField(value: string): string {
  if (!value) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptField(payload: string): string {
  if (!payload || !payload.startsWith('v1:')) return payload;
  const [, ivB64, tagB64, dataB64] = payload.split(':');
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]);
  return decrypted.toString('utf8');
}

export function hashForSearch(value: string): string {
  const normalized = value.replace(/\D/g, '').toLowerCase().trim();
  return crypto.createHmac('sha256', getKey()).update(normalized).digest('hex');
}

export function hashEmailForSearch(email: string): string {
  const normalized = email.toLowerCase().trim();
  return crypto.createHmac('sha256', getKey()).update(normalized).digest('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generatePublicToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function generateReferenceNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `AH-${ymd}-${rand}`;
}
