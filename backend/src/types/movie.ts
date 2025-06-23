/**
 * Base movie interface with shared properties
 */
export interface BaseMovie {
  title: string;
  release_year?: number;
  genre?: string;
  poster?: string;
  rating?: number;
}

/**
 * Movie interface with ID
 */
export interface Movie extends BaseMovie {
  id: string;
  created_at: Date;
  updated_at?: Date;
}

/**
 * Movie creation data
 */
export interface CreateMovieDto extends BaseMovie {
  // Additional properties specific for creation
}

/**
 * Movie update data
 */
export interface UpdateMovieDto extends Partial<BaseMovie> {
  // Partial makes all properties optional for updates
}

/**
 * Movie query parameters
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
  order?: 'ASC' | 'DESC'; // Sort direction
}
