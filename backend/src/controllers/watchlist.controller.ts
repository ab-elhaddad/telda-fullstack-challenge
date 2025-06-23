import { Response, NextFunction } from 'express';
import watchlistService from '../services/watchlist.service';
import { AddToWatchlistDto, UpdateWatchlistDto, WatchlistQueryParams } from '../types/watchlist';
import { successResponse, createdResponse } from '../utils/response';
import { Request as ExpressRequest } from 'express';

interface ExtendedRequest extends ExpressRequest {
  user?: { id: number; role: string };
}

class WatchlistController {
  /**
   * Add movie to user's watchlist
   * @route POST /api/watchlist
   */
  async addToWatchlist(req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: AddToWatchlistDto = req.body;

      const watchlistItem = await watchlistService.addToWatchlist(userId, data);

      createdResponse(res, { watchlistItem }, 'Movie added to watchlist successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's watchlist
   * @route GET /api/watchlist
   */
  async getUserWatchlist(req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const status = req.query.status as string;
      const params: WatchlistQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        status: status === 'to_watch' || status === 'watched' ? status : 'all',
        sort_by: (req.query.sort_by as string) || 'added_at',
        order: ((req.query.order as string) || 'DESC').toUpperCase() as 'ASC' | 'DESC',
      };

      const result = await watchlistService.getUserWatchlist(userId, params);

      successResponse(res, result, 'Watchlist retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove movie from watchlist
   * @route DELETE /api/watchlist/:movieId
   */
  async removeFromWatchlist(
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const movieId = parseInt(req.params.movieId);

      await watchlistService.removeFromWatchlist(userId, movieId);

      successResponse(res, {}, 'Movie removed from watchlist successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update watchlist item status
   * @route PATCH /api/watchlist/:movieId/status
   */
  async updateWatchlistStatus(
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const movieId = parseInt(req.params.movieId);
      const data: UpdateWatchlistDto = req.body;

      const updatedItem = await watchlistService.updateWatchlistStatus(userId, movieId, data);

      successResponse(res, { watchlistItem: updatedItem }, 'Watchlist status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new WatchlistController();
