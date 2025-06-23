import { Pool, PoolClient } from 'pg';
import config from '@config/index';
import logger from '@config/logger';

// Create a connection pool
const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
});

// Listen for errors on the pool
pool.on('error', (err: Error) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test the database connection
const testConnection = async (): Promise<void> => {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    logger.info('PostgreSQL database connection established successfully');
  } catch (error) {
    logger.error('Error connecting to PostgreSQL database:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
};

// Query function with proper error handling and type safety
const query = async <T>(text: string, params?: any[]): Promise<T[]> => {
  const start = Date.now();
  let client: PoolClient | null = null;
  
  try {
    client = await pool.connect();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug(`Executed query: ${text} - Duration: ${duration}ms - Rows: ${result.rowCount}`);
    
    return result.rows as T[];
  } catch (error) {
    logger.error(`Error executing query: ${text}`, error);
    throw error;
  } finally {
    if (client) client.release();
  }
};

// Transaction function for executing multiple queries in a transaction
const transaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  let client: PoolClient | null = null;
  
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    
    const result = await callback(client);
    
    await client.query('COMMIT');
    return result;
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    logger.error('Error executing transaction:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
};

export default {
  pool,
  query,
  transaction,
  testConnection,
};
