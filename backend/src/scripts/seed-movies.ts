import dotenv from 'dotenv';
// Load environment variables before importing other modules
dotenv.config();
import MovieSeeder from '../utils/seed.utils';
import logger from '../config/logger';

/**
 * Script to seed database with movies from TMDB
 */
async function seedMovies(): Promise<void> {
  try {
    // Check if TMDB API key is configured
    const tmdbApiKey = process.env.TMDB_API_KEY;
    if (!tmdbApiKey) {
      logger.error('TMDB_API_KEY environment variable is required but not set');
      process.exit(1);
    }

    logger.info('Starting movie seeding process');
    
    // Number of pages to fetch (default: 5, can be overridden via command line)
    const pages = process.argv[2] ? parseInt(process.argv[2], 10) : 5;
    
    const movieSeeder = new MovieSeeder({ tmdbApiKey });
    await movieSeeder.seedMovies(pages);
    
    logger.info('Movie seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Movie seeding failed:', error);
    process.exit(1);
  }
}

// Execute seeding
seedMovies();
