import { Router } from 'express';
import movieController from '@controllers/movie.controller';
import { authenticate } from '@middleware/auth.middleware';
import validate from '@middleware/validation.middleware';
import { createMovieSchema, updateMovieSchema, movieQuerySchema, searchMoviesSchema } from '@schemas/movie.schema';

const router = Router();

/**
 * @route GET /api/movies
 * @desc Get all movies with advanced filtering and pagination
 * @access Public
 */
router.get('/', validate({ query: movieQuerySchema }), movieController.getAllMovies);

/**
 * @route GET /api/movies/search
 * @desc Search movies with simplified parameters
 * @access Public
 */
router.get('/search', validate({ query: searchMoviesSchema }), movieController.getAllMovies);

/**
 * @route GET /api/movies/:id
 * @desc Get a movie by ID
 * @access Public
 */
router.get('/:id', movieController.getMovieById);

/**
 * @route POST /api/movies
 * @desc Create a new movie
 * @access Private
 */
router.post(
  '/', 
  authenticate(), 
  validate({ body: createMovieSchema }), 
  movieController.createMovie
);

/**
 * @route PUT /api/movies/:id
 * @desc Update a movie
 * @access Private
 */
router.put(
  '/:id', 
  authenticate(), 
  validate({ body: updateMovieSchema }), 
  movieController.updateMovie
);

/**
 * @route DELETE /api/movies/:id
 * @desc Delete a movie
 * @access Private
 */
router.delete('/:id', authenticate(), movieController.deleteMovie);

export default router;
