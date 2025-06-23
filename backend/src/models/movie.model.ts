import db from '@config/database';
import { Movie, CreateMovieDto, UpdateMovieDto, MovieQueryParams } from '../types/movie';
import logger from '@config/logger';

/**
 * Movie model with direct PostgreSQL queries
 */
export const MovieModel = {
  /**
   * Set up movies table
   */
  async setupTable(): Promise<void> {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS movies (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          director VARCHAR(255),
          release_year INTEGER,
          genre VARCHAR(100),
          poster VARCHAR(500),
          rating DECIMAL(3,1),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP
        )
      `;
      
      await db.query(query);
      logger.info('Movies table checked/created successfully');
    } catch (error) {
      logger.error('Error setting up movies table:', error);
      throw error;
    }
  },

  /**
   * Get all movies with pagination and filtering
   */
  async findAll(params: MovieQueryParams): Promise<{ movies: Movie[]; total: number }> {
    try {
      // Build query conditionally based on provided params
      let query = 'SELECT * FROM movies WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // General search across multiple fields
      if (params.search) {
        query += ` AND (title ILIKE $${paramIndex} OR director ILIKE $${paramIndex} OR genre ILIKE $${paramIndex})`;
        queryParams.push(`%${params.search}%`);
        paramIndex++;
      }
      
      // Add specific filters if provided
      if (params.title) {
        query += ` AND title ILIKE $${paramIndex}`;
        queryParams.push(`%${params.title}%`);
        paramIndex++;
      }
      
      if (params.director) {
        query += ` AND director ILIKE $${paramIndex}`;
        queryParams.push(`%${params.director}%`);
        paramIndex++;
      }
      
      if (params.genre) {
        query += ` AND genre ILIKE $${paramIndex}`;
        queryParams.push(`%${params.genre}%`);
        paramIndex++;
      }
      
      // Exact year filter
      if (params.year) {
        query += ` AND release_year = $${paramIndex}`;
        queryParams.push(params.year);
        paramIndex++;
      }
      
      // Year range filters
      if (params.year_from) {
        query += ` AND release_year >= $${paramIndex}`;
        queryParams.push(params.year_from);
        paramIndex++;
      }
      
      if (params.year_to) {
        query += ` AND release_year <= $${paramIndex}`;
        queryParams.push(params.year_to);
        paramIndex++;
      }
      
      // Rating range filters
      if (params.min_rating) {
        query += ` AND rating >= $${paramIndex}`;
        queryParams.push(params.min_rating);
        paramIndex++;
      }
      
      if (params.max_rating) {
        query += ` AND rating <= $${paramIndex}`;
        queryParams.push(params.max_rating);
        paramIndex++;
      }

      // Count total records for pagination
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
      const countResult = await db.query<{ count: string }>(countQuery, queryParams);
      const total = parseInt(countResult[0].count, 10);
      
      // Add sorting and pagination
      const sortBy = params.sort_by || 'created_at';
      const order = params.order || 'DESC';
      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = (page - 1) * limit;
      
      query += ` ORDER BY ${sortBy} ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit, offset);
      
      const movies = await db.query<Movie>(query, queryParams);
      
      return { movies, total };
    } catch (error) {
      logger.error('Error fetching movies:', error);
      throw error;
    }
  },

  /**
   * Find a single movie by ID
   */
  async findById(id: string): Promise<Movie | null> {
    try {
      const query = 'SELECT * FROM movies WHERE id = $1';
      const result = await db.query<Movie>(query, [id]);
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error(`Error fetching movie with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new movie
   */
  async create(movieData: CreateMovieDto): Promise<Movie> {
    try {
      const { title, director, release_year, genre, poster, rating } = movieData;
      
      const query = `
        INSERT INTO movies (title, director, release_year, genre, poster, rating)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const result = await db.query<Movie>(query, [title, director || null, release_year || null, genre || null, poster || null, rating || null]);
      
      return result[0];
    } catch (error) {
      logger.error('Error creating movie:', error);
      throw error;
    }
  },

  /**
   * Update an existing movie
   */
  async update(id: string, movieData: UpdateMovieDto): Promise<Movie | null> {
    try {
      // Build dynamic query based on provided fields
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Add each provided field to the update
      if (movieData.title !== undefined) {
        updates.push(`title = $${paramIndex}`);
        values.push(movieData.title);
        paramIndex++;
      }
      
      if (movieData.director !== undefined) {
        updates.push(`director = $${paramIndex}`);
        values.push(movieData.director);
        paramIndex++;
      }
      
      if (movieData.release_year !== undefined) {
        updates.push(`release_year = $${paramIndex}`);
        values.push(movieData.release_year);
        paramIndex++;
      }
      
      if (movieData.genre !== undefined) {
        updates.push(`genre = $${paramIndex}`);
        values.push(movieData.genre);
        paramIndex++;
      }
      
      if (movieData.poster !== undefined) {
        updates.push(`poster = $${paramIndex}`);
        values.push(movieData.poster);
        paramIndex++;
      }
      
      if (movieData.rating !== undefined) {
        updates.push(`rating = $${paramIndex}`);
        values.push(movieData.rating);
        paramIndex++;
      }
      
      // Add updated_at timestamp
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // If no fields to update, return null
      if (updates.length === 0) {
        return null;
      }
      
      // Create query with all updates
      const query = `
        UPDATE movies
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      
      values.push(id);
      
      const result = await db.query<Movie>(query, values);
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error(`Error updating movie with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a movie by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM movies WHERE id = $1 RETURNING id';
      const result = await db.query<{ id: string }>(query, [id]);
      
      return result.length > 0;
    } catch (error) {
      logger.error(`Error deleting movie with id ${id}:`, error);
      throw error;
    }
  },
};

export default MovieModel;
