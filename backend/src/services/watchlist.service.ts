import WatchlistModel from '../models/watchlist.model';
import {
  Watchlist,
  AddToWatchlistDto,
  WatchlistQueryParams,
  WatchlistPaginated,
  UpdateWatchlistDto,
} from '../types/watchlist';

class WatchlistService {
  /**
   * Add movie to user's watchlist
   * @param userId User ID
   * @param data Watchlist data containing movie ID
   * @returns Created watchlist item
   */
  async addToWatchlist(userId: number, data: AddToWatchlistDto): Promise<Watchlist> {
    return WatchlistModel.addToWatchlist(userId, data);
  }

  /**
   * Get user's watchlist with pagination
   * @param userId User ID
   * @param params Query parameters with pagination
   * @returns Watchlist items with movie details and pagination data
   */
  async getUserWatchlist(
    userId: number,
    params: WatchlistQueryParams,
  ): Promise<WatchlistPaginated> {
    return WatchlistModel.getUserWatchlist(userId, params);
  }

  /**
   * Remove movie from watchlist
   * @param userId User ID
   * @param movieId Movie ID
   * @returns True if removed
   */
  async removeFromWatchlist(userId: number, movieId: number): Promise<boolean> {
    return WatchlistModel.removeFromWatchlist(userId, movieId);
  }

  /**
   * Update watchlist item status
   * @param userId User ID
   * @param movieId Movie ID
   * @param data Update data with new status
   * @returns Updated watchlist item
   */
  async updateWatchlistStatus(
    userId: number,
    movieId: number,
    data: UpdateWatchlistDto,
  ): Promise<Watchlist | null> {
    return WatchlistModel.updateWatchlistStatus(userId, movieId, data);
  }
}

export default new WatchlistService();
