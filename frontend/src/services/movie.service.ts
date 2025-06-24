/**
 * Movie service for handling movie-related API requests
 */
import apiService from "./api.service";
import { Movie, MovieListResponse, MovieQueryParams } from "../types/movie";

/**
 * Service for handling movie-related operations
 */
class MovieService {
  /**
   * Get movies with advanced filtering and sorting options
   * @param params Query parameters for filtering, sorting and pagination
   */
  async getMovies(params: MovieQueryParams = {}) {
    // Convert numeric parameters to strings for API compatibility
    const queryParams = Object.entries(params).reduce<Record<string, string>>(
      (result, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          result[key] = value.toString();
        }
        return result;
      },
      {}
    );

    return apiService.get<MovieListResponse>("/movies", { params: queryParams });
  }

  /**
   * Get movie details by ID
   */
  async getMovieById(id: string) {
    // Updated parameter type from number to string to match backend ID type
    const res = await apiService.get<{ movie: Movie }>(`/movies/${id}`);
    console.log({ res });
    return res;
  }

  /**
   * Get related movies
   */
  async getRelatedMovies(movieId: string, limit = 5) {
    return apiService.get<Movie[]>(`/movies/${movieId}/related`, {
      params: { limit: limit.toString() },
    });
  }

  /**
   * Get trending movies
   */
  async getTrendingMovies(limit = 10) {
    return apiService.get<Movie[]>("/movies/trending", {
      params: { limit: limit.toString() },
    });
  }
}

export const movieService = new MovieService();
export default movieService;
