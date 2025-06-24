import MovieModel from '@models/movie.model';
import { BaseMovie, Movie, MovieQueryParams } from '../types/movie';
import { NotFoundException, BadRequestException } from '@utils/exceptions';
import logger from '@config/logger';

/**
 * Movie service - contains business logic for movie operations
 */
export class MovieService {
  /**
   * Get all movies with pagination and filtering
   */
  async getAllMovies(params: MovieQueryParams): Promise<{ movies: Movie[]; total: number }> {
    try {
      return await MovieModel.findAll(params);
    } catch (error) {
      logger.error('Error in MovieService.getAllMovies:', error);
      throw error;
    }
  }

  /**
   * Get a single movie by ID
   */
  async getMovieById(id: string): Promise<Movie> {
    try {
      const movie = await MovieModel.findById(id);

      if (!movie) {
        throw new NotFoundException('Movie');
      }

      return movie;
    } catch (error) {
      logger.error(`Error in MovieService.getMovieById for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new movie
   */
  async createMovie(movieData: BaseMovie): Promise<Movie> {
    try {
      // Additional validation or business logic can be implemented here
      return await MovieModel.create(movieData);
    } catch (error) {
      logger.error('Error in MovieService.createMovie:', error);
      throw error;
    }
  }

  /**
   * Update an existing movie
   */
  async updateMovie(id: string, movieData: BaseMovie): Promise<Movie> {
    try {
      // Verify movie exists
      const exists = await MovieModel.findById(id);

      if (!exists) {
        throw new NotFoundException('Movie');
      }

      // Update the movie
      const updatedMovie = await MovieModel.update(id, movieData);

      if (!updatedMovie) {
        throw new BadRequestException('Failed to update movie');
      }

      return updatedMovie;
    } catch (error) {
      logger.error(`Error in MovieService.updateMovie for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a movie by ID
   */
  async deleteMovie(id: string): Promise<void> {
    try {
      // Verify movie exists
      const exists = await MovieModel.findById(id);

      if (!exists) {
        throw new NotFoundException('Movie');
      }

      // Delete the movie
      const deleted = await MovieModel.delete(id);

      if (!deleted) {
        throw new BadRequestException('Failed to delete movie');
      }
    } catch (error) {
      logger.error(`Error in MovieService.deleteMovie for id ${id}:`, error);
      throw error;
    }
  }
}

export default new MovieService();
