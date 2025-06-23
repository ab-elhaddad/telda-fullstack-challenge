// Movie model type
export interface Movie {
  id: number;
  title: string;
  director?: string | null;
  release_year?: number | null;
  genre?: string | null;
  poster?: string | null;
  rating?: number | null;
  created_at: string;
  updated_at: string;
  // Watchlist-related fields
  in_watchlist?: boolean;
  status?: 'TO_WATCH' | 'WATCHING' | 'WATCHED';
  overview?: string | null;
  cast?: string | null;
}

// Movie creation data type
export interface CreateMovieData {
  title: string;
  director?: string | null;
  release_year?: number | null;
  genre?: string | null;
  poster?: string | null;
  rating?: number | null;
}

// Movie update data type
export interface UpdateMovieData {
  title?: string;
  director?: string | null;
  release_year?: number | null;
  genre?: string | null;
  poster?: string | null;
  rating?: number | null;
}

// Movie query parameters for filtering and pagination
export interface MovieQueryParams {
  search?: string;
  genre?: string;
  year_from?: number;
  year_to?: number;
  rating_from?: number;
  rating_to?: number;
  sort_by?: 'title' | 'release_year' | 'rating' | 'created_at';
  sort_direction?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Movie search parameters (simplified)
export interface MovieSearchParams {
  query?: string;
  page?: number;
  limit?: number;
}

// Movie list response with pagination
export interface MovieListResponse {
  movies: Movie[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
