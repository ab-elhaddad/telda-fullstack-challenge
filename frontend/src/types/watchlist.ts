import { Movie } from "./movie";

/**
 * Status options for watchlist items
 * Aligned with backend status options
 */
export enum WatchlistItemStatus {
  TO_WATCH = "to_watch",
  WATCHED = "watched",
}

/**
 * Watchlist item model
 * Aligned with backend Watchlist
 */
export interface Watchlist {
  id: number;
  user_id: number;
  movie_id: number;
  added_at: Date;
  status: WatchlistItemStatus;
}

/**
 * Watchlist item with movie details
 * Aligned with backend WatchlistWithMovie
 */
export interface WatchlistWithMovie extends Watchlist {
  movie: Movie;
}

/**
 * Add to watchlist request
 * Aligned with backend AddToWatchlistDto
 */
export interface AddToWatchlistDto {
  movie_id: number;
  status?: WatchlistItemStatus;
}

/**
 * Update watchlist status request
 * Aligned with backend UpdateWatchlistDto
 */
export interface UpdateWatchlistDto {
  status: WatchlistItemStatus;
}

/**
 * Query parameters for fetching watchlist
 * Aligned with backend WatchlistQueryParams
 */
export interface WatchlistQueryParams {
  page?: number;
  limit?: number;
  status?: WatchlistItemStatus | "all";
  sort_by?: string;
  order?: "ASC" | "DESC"; // Changed to match backend enum values
}

// Check watchlist response
export interface CheckWatchlistResponse {
  in_watchlist: boolean;
  status?: WatchlistItemStatus;
}

/**
 * Watchlist response with pagination
 * Aligned with backend WatchlistPaginated
 */
export interface WatchlistPaginated {
  watchlist: WatchlistWithMovie[]; // Changed from items to watchlist to match backend
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
