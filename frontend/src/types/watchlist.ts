import { Movie } from './movie';

// Status options for watchlist items
export type WatchlistItemStatus = 'to_watch' | 'watched';

// Watchlist item model
export interface WatchlistItem {
  id: number;
  user_id: number;
  movie_id: number;
  status: WatchlistItemStatus;
  added_at: string;
  movie: Movie;
}

// Add to watchlist request
export interface AddToWatchlistDto {
  movie_id: number;
}

// Update watchlist status request
export interface UpdateWatchlistDto {
  status: WatchlistItemStatus;
}

// Query parameters for fetching watchlist
export interface WatchlistQueryParams {
  page?: number;
  limit?: number;
  status?: WatchlistItemStatus | 'all';
  sort_by?: 'added_at' | 'title' | 'rating';
  sort_direction?: 'asc' | 'desc';
}

// Check watchlist response
export interface CheckWatchlistResponse {
  in_watchlist: boolean;
  status?: WatchlistItemStatus;
}

// Watchlist response with pagination
export interface WatchlistResponse {
  items: WatchlistItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
