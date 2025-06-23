import { Request, Response, NextFunction } from 'express';
import movieService from '@services/movie.service';
import { successResponse, createdResponse } from '@utils/response';
import { MovieQueryParams, CreateMovieDto, UpdateMovieDto } from '../types/movie';
import logger from '@config/logger';

/**
 * Movie controller - handles HTTP requests for movie resources
 */
export class MovieController {
  /**
   * Get all movies with advanced search, filtering, and pagination
   * @route GET /api/movies
   */
  async getAllMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: MovieQueryParams = {
        // General search term
        search: req.query.search as string,

        // Specific field filters
        title: req.query.title as string,
        genre: req.query.genre as string,

        // Year filters
        year: req.query.year ? Number(req.query.year) : undefined,
        year_from: req.query.year_from ? Number(req.query.year_from) : undefined,
        year_to: req.query.year_to ? Number(req.query.year_to) : undefined,

        // Rating filters
        min_rating: req.query.min_rating ? Number(req.query.min_rating) : undefined,
        max_rating: req.query.max_rating ? Number(req.query.max_rating) : undefined,

        // Pagination
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,

        // Sorting
        sort_by: (req.query.sort_by as string) || 'created_at',
        order: (req.query.order as 'ASC' | 'DESC') || 'DESC',
      };

      const { movies, total } = await movieService.getAllMovies(queryParams);

      // Calculate pagination metadata
      const page = queryParams.page || 1;
      const limit = queryParams.limit || 10;
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      successResponse(res, {
        movies,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext,
          hasPrev,
        },
      });
    } catch (error) {
      logger.error('Error in MovieController.getAllMovies:', error);
      next(error);
    }
  }

  /**
   * Get a single movie by ID
   * @route GET /api/movies/:id
   */
  async getMovieById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const movie = await movieService.getMovieById(id);
      successResponse(res, { movie });
    } catch (error) {
      logger.error(`Error in MovieController.getMovieById for id ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Create a new movie
   * @route POST /api/movies
   */
  async createMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movieData: CreateMovieDto = req.body;
      const newMovie = await movieService.createMovie(movieData);
      createdResponse(res, { movie: newMovie });
    } catch (error) {
      logger.error('Error in MovieController.createMovie:', error);
      next(error);
    }
  }

  /**
   * Update an existing movie
   * @route PUT /api/movies/:id
   */
  async updateMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const movieData: UpdateMovieDto = req.body;
      const updatedMovie = await movieService.updateMovie(id, movieData);
      successResponse(res, { movie: updatedMovie });
    } catch (error) {
      logger.error(`Error in MovieController.updateMovie for id ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Delete a movie
   * @route DELETE /api/movies/:id
   */
  async deleteMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await movieService.deleteMovie(id);
      successResponse(res, null, 'Movie deleted successfully');
    } catch (error) {
      logger.error(`Error in MovieController.deleteMovie for id ${req.params.id}:`, error);
      next(error);
    }
  }
}

export default new MovieController();
