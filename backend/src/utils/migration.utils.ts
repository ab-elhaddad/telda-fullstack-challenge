import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import db from '../config/database';
import logger from '../config/logger';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

interface MigrationRecord {
  id: string;
  name: string;
  applied_at: Date;
}

/**
 * Migration utility to handle database schema migrations
 */
export default class MigrationRunner {
  private migrationsDir: string;

  constructor() {
    this.migrationsDir = path.join(process.cwd(), 'migrations');
  }

  /**
   * Setup migration tracking table
   */
  private async setupMigrationTable(): Promise<void> {
    try {
      // Create migration tracking table if not exists
      await db.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      logger.info('Migration tracking table checked/created');
    } catch (error) {
      logger.error('Error setting up migration table:', error);
      throw error;
    }
  }

  /**
   * Get list of already applied migrations
   */
  private async getAppliedMigrations(): Promise<string[]> {
    try {
      const result = await db.query<MigrationRecord>('SELECT name FROM migrations ORDER BY id ASC');
      return result.map(record => record.name);
    } catch (error) {
      logger.error('Error getting applied migrations:', error);
      throw error;
    }
  }

  /**
   * Get list of all migration files
   */
  private async getMigrationFiles(): Promise<string[]> {
    try {
      // Check if migrations directory exists
      if (!fs.existsSync(this.migrationsDir)) {
        logger.error('Migrations directory does not exist:', this.migrationsDir);
        throw new Error(`Migrations directory not found: ${this.migrationsDir}`);
      }
      
      const files = await readdir(this.migrationsDir);
      // Filter for SQL files and sort them
      return files
        .filter(file => file.endsWith('.sql'))
        .sort();
    } catch (error) {
      logger.error('Error getting migration files:', error);
      throw error;
    }
  }

  /**
   * Record a migration as applied
   */
  private async recordMigration(name: string): Promise<void> {
    try {
      await db.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
      logger.info(`Recorded migration: ${name}`);
    } catch (error) {
      logger.error(`Error recording migration ${name}:`, error);
      throw error;
    }
  }

  /**
   * Apply a single migration file
   */
  private async applyMigration(fileName: string): Promise<void> {
    const filePath = path.join(this.migrationsDir, fileName);
    
    try {
      // Read migration file content
      const sql = await readFile(filePath, 'utf8');
      logger.info(`Applying migration: ${fileName}`);
      
      // Use a transaction for each migration
      await db.transaction(async (client) => {
        // Run the migration SQL
        await client.query(sql);
        // Record the migration
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [fileName]);
      });
      
      logger.info(`Successfully applied migration: ${fileName}`);
    } catch (error) {
      logger.error(`Error applying migration ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  public async runMigrations(): Promise<void> {
    try {
      // Setup migration table
      await this.setupMigrationTable();
      
      // Get already applied migrations
      const appliedMigrations = await this.getAppliedMigrations();
      
      // Get all migration files
      const migrationFiles = await this.getMigrationFiles();
      
      // Filter for pending migrations
      const pendingMigrations = migrationFiles.filter(file => !appliedMigrations.includes(file));
      
      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations to apply');
        return;
      }
      
      logger.info(`Found ${pendingMigrations.length} pending migrations`);
      
      // Apply each pending migration in sequence
      for (const file of pendingMigrations) {
        await this.applyMigration(file);
      }
      
      logger.info(`Successfully applied ${pendingMigrations.length} migrations`);
    } catch (error) {
      logger.error('Migration process failed:', error);
      throw error;
    }
  }
}
