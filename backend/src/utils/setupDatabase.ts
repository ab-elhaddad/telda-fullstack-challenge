import logger from '../config/logger';
import db from '../config/database';
import { initializeDatabase } from '../db';

/**
 * Setup database tables and initial data
 */
export const setupDatabase = async (): Promise<void> => {
  try {
    logger.info('Setting up database...');

    // Test database connection
    await db.testConnection();

    // Initialize database using SQL scripts
    await initializeDatabase();

    logger.info('Database setup completed successfully');
  } catch (error) {
    logger.error('Database setup failed:', error);
    throw error;
  }
};

export default setupDatabase;
