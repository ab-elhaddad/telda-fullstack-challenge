import { Router } from 'express';
import watchlistController from '@controllers/watchlist.controller';
import validate from '@middleware/validation.middleware';
import { addToWatchlistSchema, watchlistQueryParamsSchema, updateWatchlistSchema } from '@schemas/watchlist.schema';
import { authenticate } from '@middleware/auth.middleware';

const router = Router();

// All watchlist routes require authentication
router.use(authenticate());

// Add movie to watchlist
router.post(
  '/',
  validate({ body: addToWatchlistSchema }),
  watchlistController.addToWatchlist
);

// Get user's watchlist
router.get(
  '/',
  validate({ query: watchlistQueryParamsSchema }),
  watchlistController.getUserWatchlist
);

// Check if movie is in watchlist
router.get(
  '/check/:movieId',
  watchlistController.checkMovieInWatchlist
);

// Remove movie from watchlist
router.delete(
  '/:movieId',
  watchlistController.removeFromWatchlist
);

// Update watchlist item status (to_watch/watched)
router.patch(
  '/:movieId/status',
  validate({ body: updateWatchlistSchema }),
  watchlistController.updateWatchlistStatus
);

export default router;
