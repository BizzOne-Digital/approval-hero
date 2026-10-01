import { connectDatabase } from '../config/database';
import { hashPassword } from '../controllers/authController';
import { AdminUser } from '../models';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

const DEFAULT_EMAIL = 'admin@approvalhero.ca';
const DEFAULT_PASSWORD = 'ChangeMe123!';
const DEFAULT_NAME = 'Approval Hero Admin';

async function createAdmin(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL || DEFAULT_EMAIL).toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  const name = process.env.ADMIN_NAME || DEFAULT_NAME;

  await connectDatabase();

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    logger.info(`Admin user already exists: ${email}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const hashedPassword = await hashPassword(password);

  await AdminUser.create({
    email,
    password: hashedPassword,
    name,
    role: 'admin',
  });

  logger.info(`Admin user created successfully: ${email}`);
  if (!process.env.ADMIN_PASSWORD) {
    logger.warn(`Using default password. Set ADMIN_PASSWORD in .env for production.`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

createAdmin().catch((error) => {
  logger.error('Failed to create admin user:', error);
  process.exit(1);
});
