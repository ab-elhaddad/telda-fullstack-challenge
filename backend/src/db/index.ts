import db from '@config/database';
import fs from 'fs';
import path from 'path';
import logger from '@config/logger';

/**
 * Parse SQL script into individual commands
 * @param sql Raw SQL string
 * @returns Array of SQL commands
 */
const parseSqlCommands = (sql: string): string[] => {
  // Remove SQL comments (-- style)
  const withoutComments = sql.replace(/--.*$/gm, '');

  // Split by semicolons, but be more careful about whitespace
  const commands = withoutComments
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);

  return commands;
};

/**
 * Run SQL script from file
 * @param filename SQL script filename
 */
export const runSqlScript = async (filename: string): Promise<void> => {
  try {
    const filePath = path.join(__dirname, 'migrations', filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    logger.info(`Running SQL script: ${filename}`);

    // Parse commands more carefully
    const commands = parseSqlCommands(sql);

    logger.info(`Found ${commands.length} SQL commands to execute`);

    // Execute each command in a transaction
    await db.transaction(async client => {
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        try {
          logger.debug(
            `Executing command ${i + 1}/${commands.length}: ${command.substring(0, 50)}...`,
          );
          await client.query(command);
        } catch (error) {
          logger.error(`Failed to execute command ${i + 1}: ${command}`);
          throw error;
        }
      }
    });

    logger.info(`Successfully executed SQL script: ${filename}`);
  } catch (error) {
    logger.error(`Error executing SQL script ${filename}:`, error);
    throw error;
  }
};

/**
 * Alternative: Execute SQL script as a single command
 * This approach lets PostgreSQL handle the parsing
 */
export const runSqlScriptAsBlock = async (filename: string): Promise<void> => {
  try {
    const filePath = path.join(__dirname, 'migrations', filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    logger.info(`Running SQL script as block: ${filename}`);

    // Execute the entire script as one command
    // PostgreSQL can handle multiple statements in one query
    await db.query(sql);

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

    // Try the block approach first (simpler and more reliable)
    try {
      await runSqlScriptAsBlock('initial.sql');
    } catch (error) {
      logger.warn('Block execution failed, trying command-by-command approach');
      await runSqlScript('initial.sql');
    }

    // Run seed data if in development
    if (process.env.NODE_ENV !== 'production') {
      try {
        await runSqlScriptAsBlock('seed.sql');
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
  runSqlScriptAsBlock,
  initializeDatabase,
};
