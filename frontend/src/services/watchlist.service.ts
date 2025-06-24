/**
 * Watchlist service for handling watchlist-related API requests
 */
import apiService from "./api.service";
import {
  WatchlistWithMovie,
  WatchlistItemStatus,
  AddToWatchlistDto,
  UpdateWatchlistDto,
  WatchlistPaginated,
  WatchlistQueryParams,
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
      params: params as any, // Type cast needed for compatibility with the API service
    });
  }

  /**
   * Add movie to watchlist
   */
  async addToWatchlist(
    movie_id: number,
    status: WatchlistItemStatus = WatchlistItemStatus.TO_WATCH
  ) {
    const payload: AddToWatchlistDto = { movie_id, status };
    return apiService.post<WatchlistWithMovie>("/watchlist", payload);
  }

  /**
   * Update watchlist item status
   */
  async updateWatchlistStatus(movieId: number, status: WatchlistItemStatus) {
    const payload: UpdateWatchlistDto = { status };
    return apiService.put<WatchlistWithMovie>(`/watchlist/${movieId}`, payload);
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
