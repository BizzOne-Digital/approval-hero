import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AdminUser } from '../models';
import { sendError } from '../utils/apiResponse';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;

  if (!token) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.admin = decoded;
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.token;
  if (!token) {
    next();
    return;
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const admin = await AdminUser.findById(decoded.id).select('-password');
    if (admin) {
      req.admin = { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
    }
  } catch {
    // ignore
  }
  next();
}
