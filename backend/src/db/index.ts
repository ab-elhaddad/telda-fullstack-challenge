import db from '@config/database';
import fs from 'fs';
import path from 'path';
import logger from '@config/logger';

/**
 * Run SQL script from file
 * @param filename SQL script filename
 */
export const runSqlScript = async (filename: string): Promise<void> => {
  try {
    const filePath = path.join(__dirname, 'migrations', filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    logger.info(`Running SQL script: ${filename}`);
    
    // Split the file by SQL commands (separated by semicolons)
    const commands = sql
      .replace(/(\r\n|\n|\r)/gm, ' ') // Replace newlines with spaces
      .split(';')
      .filter(cmd => cmd.trim() !== ''); // Remove empty commands
      
    // Execute each command in a transaction
    await db.transaction(async (client) => {
      for (const command of commands) {
        await client.query(command);
      }
    });
    
    logger.info(`Successfully executed SQL script: ${filename}`);
  } catch (error) {
    logger.error(`Error executing SQL script ${filename}:`, error);
    throw error;
  }
};

/**
 * Initialize the database with schema and initial data
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    logger.info('Initializing database...');
    
    // Run initial migration
    await runSqlScript('initial.sql');
    
    // Run seed data if in development
    if (process.env.NODE_ENV !== 'production') {
      try {
        await runSqlScript('seed.sql');
      } catch (error) {
        logger.warn('Seed script not found or failed, continuing anyway');
      }
    }
    
    logger.info('Database initialization completed');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

export default {
  runSqlScript,
  initializeDatabase,
};
