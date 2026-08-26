import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';
import { AdminUser, ActivityLog } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 12;

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const { email, password } = req.body;

  const admin = await AdminUser.findOne({ email: email.toLowerCase() });
  if (!admin) {
    sendError(res, 'Invalid email or password', 401);
    return;
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    sendError(res, 'Invalid email or password', 401);
    return;
  }

  const signOptions: SignOptions = { expiresIn: '7d' };
  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    env.JWT_SECRET,
    signOptions
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  admin.lastLogin = new Date();
  await admin.save();

  await ActivityLog.create({
    adminId: admin._id,
    action: 'login',
    entityType: 'AdminUser',
    entityId: admin.id,
    ipAddress: req.ip,
  });

  sendSuccess(res, {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
}

export function logout(_req: AuthRequest, res: Response): void {
  res.clearCookie('token', { path: '/' });
  sendSuccess(res, null, 'Logged out successfully');
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  if (!req.admin) {
    sendError(res, 'Not authenticated', 401);
    return;
  }

  const admin = await AdminUser.findById(req.admin.id).select('-password');
  if (!admin) {
    sendError(res, 'Admin not found', 404);
    return;
  }

  sendSuccess(res, {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    lastLogin: admin.lastLogin,
  });
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body;

  if (!req.admin) {
    sendError(res, 'Not authenticated', 401);
    return;
  }

  const admin = await AdminUser.findById(req.admin.id);
  if (!admin) throw new AppError('Admin not found', 404);

  const valid = await bcrypt.compare(currentPassword, admin.password);
  if (!valid) {
    sendError(res, 'Current password is incorrect', 400);
    return;
  }

  admin.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await admin.save();

  sendSuccess(res, null, 'Password updated successfully');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}
