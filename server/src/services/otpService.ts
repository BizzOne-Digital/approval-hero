import crypto from 'crypto';
import { OtpAttempt } from '../models/OtpAttempt';
import { hashForSearch } from '../utils/encryption';
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
  phone: string;
  ipAddress?: string;
}): Promise<{ sent: boolean; mockCode?: string; cooldownSeconds?: number }> {
  const phoneHash = hashForSearch(params.phone);

  const recent = await OtpAttempt.findOne({
    applicationId: params.applicationId,
    phoneSearchHash: phoneHash,
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
    phoneSearchHash: phoneHash,
    otpHash,
    expiresAt,
    attempts: 0,
    verified: false,
    ipAddress: params.ipAddress,
  });

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioVerifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (twilioSid && twilioToken && twilioVerifySid) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const res = await fetch(`https://verify.twilio.com/v2/Services/${twilioVerifySid}/Verifications`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: params.phone, Channel: 'sms' }),
      });
      if (!res.ok) {
        logger.error('Twilio Verify send failed', await res.text());
        throw new Error('SMS provider error');
      }
      return { sent: true };
    } catch (err) {
      logger.error('Twilio OTP send error', err);
      throw new Error('Unable to send verification code');
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SMS verification is not configured');
  }

  logger.info(`[DEV OTP] Application ${params.applicationId}: verification code generated (mock provider)`);
  return { sent: true, mockCode: code };
}

export async function verifyApplicationOtp(params: {
  applicationId: string;
  phone: string;
  code: string;
}): Promise<boolean> {
  const phoneHash = hashForSearch(params.phone);
  const attempt = await OtpAttempt.findOne({
    applicationId: params.applicationId,
    phoneSearchHash: phoneHash,
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!attempt) return false;
  if (attempt.attempts >= MAX_ATTEMPTS) return false;

  attempt.attempts += 1;
  await attempt.save();

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioVerifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (twilioSid && twilioToken && twilioVerifySid) {
    const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
    const res = await fetch(`https://verify.twilio.com/v2/Services/${twilioVerifySid}/VerificationCheck`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: params.phone, Code: params.code }),
    });
    const data = await res.json() as { status?: string };
    if (data.status === 'approved') {
      attempt.verified = true;
      await attempt.save();
      return true;
    }
    return false;
  }

  if (hashOtp(params.code) === attempt.otpHash) {
    attempt.verified = true;
    await attempt.save();
    return true;
  }

  return false;
}
