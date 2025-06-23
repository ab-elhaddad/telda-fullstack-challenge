import apiClient from './apiClient';
import {
  WatchlistItem,
  WatchlistResponse,
  AddToWatchlistDto,
  UpdateWatchlistDto,
  WatchlistQueryParams,
  CheckWatchlistResponse,
  WatchlistItemStatus
} from '@/types/watchlist';

/**
 * Watchlist service for handling user watchlist operations
 */
class WatchlistService {
  private WATCHLIST_ENDPOINT = '/watchlist';
  
  /**
   * Get the current user's watchlist with filtering and pagination
   * @param queryParams Parameters for filtering and pagination
   * @returns List of watchlist items and pagination info
   */
  async getUserWatchlist(queryParams: WatchlistQueryParams = {}): Promise<WatchlistResponse> {
    return await apiClient.get<WatchlistResponse>(this.WATCHLIST_ENDPOINT, { 
      params: queryParams 
    });
  }
  
  /**
   * Add a movie to the user's watchlist
   * @param movieId Movie ID to add
   * @returns Created watchlist item
   */
  async addToWatchlist(movieId: number): Promise<WatchlistItem> {
    const data: AddToWatchlistDto = { movie_id: movieId };
    return await apiClient.post<WatchlistItem>(this.WATCHLIST_ENDPOINT, data);
  }
  
  /**
   * Check if a movie is in the user's watchlist
   * @param movieId Movie ID to check
   * @returns Whether the movie is in the watchlist and its status
   */
  async checkMovieInWatchlist(movieId: number): Promise<CheckWatchlistResponse> {
    return await apiClient.get<CheckWatchlistResponse>(`${this.WATCHLIST_ENDPOINT}/check/${movieId}`);
  }
  
  /**
   * Remove a movie from the user's watchlist
   * @param movieId Movie ID to remove
   * @returns Success indicator
   */
  async removeFromWatchlist(movieId: number): Promise<void> {
    await apiClient.delete(`${this.WATCHLIST_ENDPOINT}/${movieId}`);
  }
  
  /**
   * Update the status of a watchlist item
   * @param movieId Movie ID to update
   * @param status New status ('to_watch' or 'watched')
   * @returns Updated watchlist item
   */
  async updateWatchlistStatus(movieId: number, status: WatchlistItemStatus): Promise<WatchlistItem> {
    const data: UpdateWatchlistDto = { status };
    return await apiClient.patch<WatchlistItem>(`${this.WATCHLIST_ENDPOINT}/${movieId}/status`, data);
  }
  
  /**
   * Toggle a movie's watchlist status - add if not in watchlist, remove if it is
   * @param movieId Movie ID to toggle
   * @returns Updated watchlist status information
   */
  async toggleWatchlist(movieId: number): Promise<{ inWatchlist: boolean }> {
    try {
      // Check if movie is in watchlist
      const checkResult = await this.checkMovieInWatchlist(movieId);
      
      if (checkResult.in_watchlist) {
        // If in watchlist, remove it
        await this.removeFromWatchlist(movieId);
        return { inWatchlist: false };
      } else {
        // If not in watchlist, add it
        await this.addToWatchlist(movieId);
        return { inWatchlist: true };
      }
    } catch (error) {
      console.error('Error toggling watchlist status:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const watchlistService = new WatchlistService();
export default watchlistService;
