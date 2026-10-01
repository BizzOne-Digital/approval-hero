import crypto from 'crypto';
import { OtpAttempt } from '../models/OtpAttempt';
import { hashEmailForSearch } from '../utils/encryption';
import { sendOtpEmail } from './emailService';
import { logger } from '../utils/logger';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function sendApplicationOtp(params: {
  applicationId: string;
  email: string;
  ipAddress?: string;
}): Promise<{ sent: boolean; mockCode?: string; cooldownSeconds?: number }> {
  const emailHash = hashEmailForSearch(params.email);

  const recent = await OtpAttempt.findOne({
    applicationId: params.applicationId,
    recipientSearchHash: emailHash,
    verified: false,
    createdAt: { $gte: new Date(Date.now() - RESEND_COOLDOWN_MS) },
  }).sort({ createdAt: -1 });

  if (recent) {
    const elapsed = Date.now() - recent.createdAt.getTime();
    const cooldownSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
    return { sent: false, cooldownSeconds };
  }

  const code = generateOtp();
  const otpHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await OtpAttempt.create({
    applicationId: params.applicationId,
    recipientSearchHash: emailHash,
    otpHash,
    expiresAt,
    attempts: 0,
    verified: false,
    ipAddress: params.ipAddress,
  });

  const emailed = await sendOtpEmail(params.email, code);

  if (emailed) {
    return { sent: true };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Email verification is not configured');
  }

  logger.info(`[DEV OTP] Application ${params.applicationId}: email verification code generated (mock provider)`);
  return { sent: true, mockCode: code };
}

export async function verifyApplicationOtp(params: {
  applicationId: string;
  email: string;
  code: string;
}): Promise<boolean> {
  const emailHash = hashEmailForSearch(params.email);
  const attempt = await OtpAttempt.findOne({
    applicationId: params.applicationId,
    recipientSearchHash: emailHash,
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!attempt) return false;
  if (attempt.attempts >= MAX_ATTEMPTS) return false;

  attempt.attempts += 1;
  await attempt.save();

  if (hashOtp(params.code) === attempt.otpHash) {
    attempt.verified = true;
    await attempt.save();
    return true;
  }

  return false;
}
