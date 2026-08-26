import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';

async function start(): Promise<void> {
  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info(`Approval Hero API running on port ${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Frontend URL: ${env.FRONTEND_URL}`);
  });
}

start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
