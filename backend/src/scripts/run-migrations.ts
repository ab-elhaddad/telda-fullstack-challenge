import dotenv from 'dotenv';
// Load environment variables before importing other modules
dotenv.config();

import MigrationRunner from '../utils/migration.utils';
import logger from '../config/logger';

/**
 * Script to run database migrations
 */
async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migration process');
    const migrationRunner = new MigrationRunner();
    await migrationRunner.runMigrations();
    logger.info('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  }
}

// Execute migrations
runMigrations();
