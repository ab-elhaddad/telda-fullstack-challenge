import axios from 'axios';
import db from '../config/database';
import logger from '../config/logger';

interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  adult: boolean;
  original_language: string;
  popularity: number;
  video: boolean;
}

interface TMDBGenre {
  id: number;
  name: string;
}

interface MovieSeedOptions {
  tmdbApiKey: string;
  pages?: number;
  genreSync?: boolean;
}

/**
 * Utility to seed the database with initial movie data from TMDB
 */
export default class MovieSeeder {
  private tmdbApiKey: string;
  private tmdbBaseUrl = 'https://api.themoviedb.org/3';
  private tmdbImageBaseUrl = 'https://image.tmdb.org/t/p/original';
  private genreMap: Record<number, string> = {};

  constructor(options: MovieSeedOptions) {
    this.tmdbApiKey = options.tmdbApiKey;
  }

  /**
   * Fetch genres from TMDB and store in memory
   */
  private async fetchGenres(): Promise<void> {
    try {
      const response = await axios.get(`${this.tmdbBaseUrl}/genre/movie/list`, {
        params: {
          api_key: this.tmdbApiKey,
        },
      });

      const genres: TMDBGenre[] = response.data.genres;

      // Create a map of genre IDs to names
      this.genreMap = genres.reduce((map, genre) => {
        map[genre.id] = genre.name;
        return map;
      }, {} as Record<number, string>);

      logger.info(`Fetched ${genres.length} genres from TMDB`);
    } catch (error) {
      logger.error('Error fetching genres from TMDB:', error);
      throw error;
    }
  }

  /**
   * Convert genre IDs to genre names
   */
  private mapGenreIdsToNames(genreIds: number[]): string[] {
    return genreIds.map(id => this.genreMap[id]).filter(name => !!name); // Filter out any undefined genres
  }

  /**
   * Fetch popular movies from TMDB
   */
  private async fetchPopularMovies(page: number): Promise<TMDBMovie[]> {
    try {
      const response = await axios.get(`${this.tmdbBaseUrl}/movie/popular`, {
        params: {
          api_key: this.tmdbApiKey,
          page,
        },
      });

      return response.data.results;
    } catch (error) {
      logger.error(`Error fetching popular movies from TMDB (page ${page}):`, error);
      throw error;
    }
  }

  /**
   * Save a movie to the database
   */
  private async saveMovie(movie: TMDBMovie): Promise<void> {
    try {
      const genreNames = this.mapGenreIdsToNames(movie.genre_ids);

      const query = `
        INSERT INTO movies (
          id, title, overview, poster, 
          release_year, genre, rating, total_views
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          poster = EXCLUDED.poster,
          release_year = EXCLUDED.release_year,
          genre = EXCLUDED.genre,
          rating = EXCLUDED.rating
        RETURNING id
      `;

      const values = [
        movie.id,
        movie.title,
        movie.overview,
        this.tmdbImageBaseUrl + movie.poster_path,
        new Date(movie.release_date).getFullYear(),
        genreNames,
        movie.vote_average,
        movie.vote_count,
      ];

      await db.query(query, values);
    } catch (error) {
      logger.error(`Error saving movie ${movie.title} to database:`, error);
      throw error;
    }
  }

  /**
   * Check if movies table exists
   */
  private async checkMoviesTable(): Promise<boolean> {
    try {
      const result = (await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'movies'
        )
      `)) as any[];
      return (result[0] as any).exists;
    } catch (error) {
      logger.error('Error checking if movies table exists:', error);
      throw error;
    }
  }

  /**
   * Seed the database with popular movies from TMDB
   */
  public async seedMovies(pages: number = 5): Promise<void> {
    try {
      // Check if movies table exists
      const tableExists = await this.checkMoviesTable();
      if (!tableExists) {
        logger.error('Movies table does not exist. Run migrations first.');
        throw new Error('Movies table not found. Run migrations before seeding.');
      }

      // Fetch genres first
      await this.fetchGenres();

      let totalSaved = 0;

      // Fetch and save multiple pages of popular movies
      for (let page = 1; page <= pages; page++) {
        const movies = await this.fetchPopularMovies(page);
        console.log({ movies });
        logger.info(`Fetched ${movies.length} movies from TMDB (page ${page})`);

        // Save each movie to database
        for (const movie of movies) {
          await this.saveMovie(movie);
          totalSaved++;
        }

        logger.info(`Saved page ${page} (${movies.length} movies)`);
      }

      logger.info(`Successfully seeded database with ${totalSaved} movies`);
    } catch (error) {
      logger.error('Error seeding movies:', error);
      throw error;
    }
  }
}
