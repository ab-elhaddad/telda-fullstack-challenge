/**
 * Base movie interface with shared properties
 * Matches backend definition
 */
export interface BaseMovie {
  title: string;
  release_year?: number;
  genre?: string;
  poster?: string;
  rating?: string;
  total_views: string;
}

/**
 * Movie model type
 * Aligned with backend Movie interface
 */
export interface Movie extends BaseMovie {
  id: string;
  created_at: Date;
  updated_at?: Date;
  // Watchlist-related fields (frontend only)
  in_watchlist?: boolean;
  status?: "to_watch" | "watched";
  overview?: string | null;
  cast?: string | null;
}

/**
 * Movie creation data type
 * Aligned with backend CreateMovieDto
 */
export interface CreateMovieData extends BaseMovie {
  // Additional properties specific for creation
}

/**
 * Movie update data type
 * Aligned with backend UpdateMovieDto
 */
export interface UpdateMovieData extends Partial<BaseMovie> {
  // Partial makes all properties optional for updates
}

/**
 * Movie query parameters for filtering and pagination
 * Aligned with backend MovieQueryParams
 */
export interface MovieQueryParams {
  search?: string; // General search term across multiple fields
  title?: string; // Filter by title
  genre?: string; // Filter by genre
  year?: number; // Exact year filter
  year_from?: number; // From year range
  year_to?: number; // To year range
  min_rating?: number; // Minimum rating filter
  max_rating?: number; // Maximum rating filter
  page?: number; // Page number for pagination
  limit?: number; // Results per page
  sort_by?: string; // Field to sort by
  order?: "ASC" | "DESC"; // Sort direction to match backend
}

// Movie search parameters (simplified)
export interface MovieSearchParams {
  query?: string;
  page?: number;
  limit?: number;
}

/**
 * Movie list response with pagination
 * Aligned with backend pagination structure
 */
export interface MovieListResponse {
  movies: Movie[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
