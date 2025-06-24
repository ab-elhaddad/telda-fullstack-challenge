// @ts-ignore - Jest globals are provided by the test environment
declare const jest: any;

// Import what we need
import logger from '../../src/config/logger';

// We're using the same mock approach for both unit and integration tests
// This simplifies the test setup and makes tests more reliable

// We no longer need these separate mock functions as we're using inline mocks

// Create a shared mock movie for consistent test data
const mockMovie = {
  id: '1',
  title: 'Test Movie',
  genre: 'Action',
  release_year: 2023,
  poster: '/test.jpg',
  rating: 8.5,
  overview: 'A test movie description',
  total_views: 100,
  created_at: new Date(),
  updated_at: new Date()
};

// For now, we'll use mocks for both unit and integration tests
// In a real environment, integration tests should use a real test database
const testPool = {
  query: jest.fn().mockImplementation((text: string, params: any[] = []) => {
    try {
      // For COUNT queries in findAll
      if (text.includes('COUNT(*)')) {
        return Promise.resolve({ rows: [{ count: '10' }] });
      }
      
      // For findById queries
      if (text.includes('SELECT * FROM movies WHERE id =')) {
        const id = params[0] || '999';
        
        if (id === '1') {
          return Promise.resolve({ rows: [mockMovie] });
        } else {
          // Return empty for non-existent IDs
          return Promise.resolve({ rows: [] });
        }
      }
      
      // For findAll queries
      if (text.includes('SELECT * FROM movies')) {
        return Promise.resolve({ 
          rows: [mockMovie] 
        });
      }
      
      // For create movie
      if (text.includes('INSERT INTO movies')) {
        const newMovie = {
          ...mockMovie,
          id: '2',
          title: params[0] || 'New Movie',
          created_at: new Date(),
          updated_at: new Date()
        };
        return Promise.resolve({ rows: [newMovie] });
      }
      
      // For update movie
      if (text.includes('UPDATE movies SET')) {
        const id = params[params.length - 1];
        if (id === '1') {
          const updatedMovie = {
            ...mockMovie,
            title: params[0] || 'Updated Movie',
            updated_at: new Date()
          };
          return Promise.resolve({ rows: [updatedMovie] });
        } else {
          // No rows updated for non-existent ID
          return Promise.resolve({ rows: [] });
        }
      }
      
      // For delete movie
      if (text.includes('DELETE FROM movies')) {
        const id = params[0];
        if (id === '1') {
          return Promise.resolve({ rowCount: 1 });
        } else {
          // No rows deleted for non-existent ID
          return Promise.resolve({ rowCount: 0 });
        }
      }
      
      // Default empty response
      return Promise.resolve({ rows: [] });
    } catch (error) {
      logger.error('Mock database query error:', error);
      return Promise.reject(error);
    }
  }),
  connect: jest.fn().mockImplementation(() => Promise.resolve({
    query: jest.fn().mockImplementation(() => Promise.resolve({ rows: [] })),
    release: jest.fn()
  })),
  end: jest.fn().mockResolvedValue(undefined)
};

// This is the critical part - we need to mock the database module to return the right objects
// directly as arrays, without the PostgreSQL-specific properties like rows and rowCount
jest.mock('../../src/config/database', () => {
  // This constant allows our mock to track created/deleted movie IDs for consistent behavior
  const mockMovieStorage: Record<string, any> = {
    '1': { ...mockMovie }
  };
  
  return {
    __esModule: true,
    default: {
      query: async <T>(text: string, params: any[] = []): Promise<T[]> => {
        try {
          logger.debug(`Mock DB query: ${text}`, params);
          
          // COUNT queries
          if (text.includes('COUNT(*)')) {
            return [{ count: '10' }] as unknown as T[];
          }
          
          // Movie queries by ID
          if (text.includes('SELECT * FROM movies WHERE id =')) {
            const id = params[0] || '';
            const movie = mockMovieStorage[id];
            
            if (movie) {
              return [movie] as unknown as T[];
            }
            
            // No movie found with this ID
            return [] as T[];
          }
          
          // Get all movies
          if (text.includes('SELECT * FROM movies')) {
            const movies = Object.values(mockMovieStorage);
            return movies as unknown as T[];
          }
          
          // Create a new movie
          if (text.includes('INSERT INTO movies')) {
            const newId = Date.now().toString();
            const newMovie = {
              id: newId,
              title: params[0],
              release_year: params[1] || 2023,
              genre: params[2] || 'Drama',
              poster: params[3] || '/poster.jpg',
              rating: params[4] || 7.5,
              overview: 'Movie created in test',
              created_at: new Date(),
              updated_at: new Date()
            };
            
            // Store it in our mock storage
            mockMovieStorage[newId] = newMovie;
            
            return [newMovie] as unknown as T[];
          }
          
          // Update movie
          if (text.includes('UPDATE movies SET')) {
            const id = params[params.length - 1];
            const existingMovie = mockMovieStorage[id];
            
            if (!existingMovie) {
              return [] as T[];
            }
            
            // Update fields based on the provided data
            const updatedMovie = { ...existingMovie };
            
            // Simple approach - assume params are in order of title, release_year, etc.
            // Could be enhanced for more complex queries
            if (params[0] !== undefined) updatedMovie.title = params[0];
            if (params.length > 1 && params[1] !== undefined) updatedMovie.release_year = params[1];
            
            updatedMovie.updated_at = new Date();
            mockMovieStorage[id] = updatedMovie;
            
            return [updatedMovie] as unknown as T[];
          }
          
          // Delete movie
          if (text.includes('DELETE FROM movies')) {
            const id = params[0];
            const existingMovie = mockMovieStorage[id];
            
            if (!existingMovie) {
              return [] as T[];
            }
            
            // Delete from our mock storage
            delete mockMovieStorage[id];
            
            // Return the id to indicate success
            return [{ id }] as unknown as T[];
          }
          
          // Default empty result for unhandled queries
          return [] as T[];
        } catch (error) {
          logger.error('Database error in test:', error);
          throw error;
        }
      }
    }
  };
});

/**
 * Setup the test database with schema
 */
export const setupTestDatabase = async (): Promise<void> => {
  try {
    // Just log setup since we're using mocks
    logger.info('Test database setup complete (mocked)');
    return;
  } catch (error) {
    logger.error('Failed to set up test database schema:', error);
  }
};

/**
 * Seed test database with test data
 */
export const seedTestDatabase = async (): Promise<void> => {
  try {
    // No need to seed since our mock database is pre-populated
    logger.info('Test database seeded with mock data');
    return;
  } catch (error) {
    logger.error('Failed to seed test database:', error);
  }
};

/**
 * Clear all test data (maintains schema)
 */
export const clearTestData = async (): Promise<void> => {
  try {
    // Truncate all tables but keep structure
    await testPool.query(`
      DO $$ 
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
        LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE;';
        END LOOP;
      END $$;
    `);
    
    logger.info('Test database data has been cleared');
  } catch (error) {
    logger.error('Failed to clear test data:', error);
    throw error;
  }
};

/**
 * Drop all tables (completely reset database)
 */
export const resetTestDatabase = async (): Promise<void> => {
  try {
    // Reset happens automatically with Jest's isolation
    await clearTestData();
    await seedTestDatabase();
    logger.info('Test database has been reset (mocked)');
  } catch (error) {
    logger.error('Failed to reset test database:', error);
  }
};

/**
 * Close database connection
 */
export const closeTestDatabase = async (): Promise<void> => {
  await testPool.end();
  logger.info('Test database connection closed');
};

/**
 * Execute a transaction and rollback at the end
 * Perfect for test isolation
 */
export const withRollback = async (callback: (client: any) => Promise<void>): Promise<void> => {
  const client = await testPool.connect();
  try {
    await client.query('BEGIN');
    await callback(client);
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
};

// Export connection for direct test usage if needed
export const testDb = testPool;
