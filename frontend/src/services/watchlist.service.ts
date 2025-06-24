/**
 * Watchlist service for handling watchlist-related API requests
 */
import apiService from "./api.service";
import {
  WatchlistItemStatus,
  AddToWatchlistDto,
  UpdateWatchlistDto,
  WatchlistPaginated,
  WatchlistQueryParams,
  WatchlistItem,
} from "../types/watchlist";

/**
 * Service for handling watchlist-related operations
 */
class WatchlistService {
  /**
   * Get user's watchlist with optional filters
   */
  async getWatchlist(params?: WatchlistQueryParams) {
    return apiService.get<WatchlistPaginated>("/watchlist", {
      params: params as any,
    });
  }

  /**
   * Add movie to watchlist
   */
  async addToWatchlist(movie_id: number) {
    const payload: AddToWatchlistDto = { movie_id };
    return apiService.post<WatchlistItem>("/watchlist", payload);
  }

  /**
   * Update watchlist item status
   */
  async updateWatchlistStatus(movieId: number, status: WatchlistItemStatus) {
    const payload: UpdateWatchlistDto = { status };
    return apiService.patch<WatchlistItem>(
      `/watchlist/${movieId}/status`,
      payload
    );
  }

  /**
   * Remove movie from watchlist
   */
  async removeFromWatchlist(movieId: number) {
    return apiService.delete<{ success: boolean }>(`/watchlist/${movieId}`);
  }
}

export const watchlistService = new WatchlistService();
export default watchlistService;
