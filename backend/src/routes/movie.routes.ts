import { Router } from 'express';
import movieController from '@controllers/movie.controller';
import { authenticate, isAdmin } from '@middleware/auth.middleware';
import validate from '@middleware/validation.middleware';
import { createMovieSchema, updateMovieSchema, movieQuerySchema } from '@schemas/movie.schema';

const router = Router();

/**
 * @route GET /api/movies
 * @desc Get all movies with advanced filtering and pagination
 * @access Public
 */
router.get('/', validate({ query: movieQuerySchema }), movieController.getAllMovies);

/**
 * @route GET /api/movies/:id
 * @desc Get a movie by ID
 * @access Public
 */
router.get('/:id', movieController.getMovieById);

/**
 * @route POST /api/movies
 * @desc Create a new movie
 * @access Private (Admin)
 */
router.post(
  '/',
  authenticate(),
  isAdmin(),
  validate({ body: createMovieSchema }),
  movieController.createMovie,
);

/**
 * @route PUT /api/movies/:id
 * @desc Update a movie
 * @access Private (Admin)
 */
router.put(
  '/:id',
  authenticate(),
  isAdmin(),
  validate({ body: updateMovieSchema }),
  movieController.updateMovie,
);

/**
 * @route DELETE /api/movies/:id
 * @desc Delete a movie
 * @access Private (Admin)
 */
router.delete('/:id', authenticate(), isAdmin(), movieController.deleteMovie);

export default router;
