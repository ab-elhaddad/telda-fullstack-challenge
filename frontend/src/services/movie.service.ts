/**
 * Movie service for handling movie-related API requests
 */
import apiService from "./api.service";
import { Movie, MovieListResponse } from "../types/movie";

/**
 * Service for handling movie-related operations
 */
class MovieService {
  /**
   * Get popular movies
   */
  async getMovies(page = 1, limit = 10) {
    return apiService.get<MovieListResponse>("/movies", {
      params: { page: page.toString(), limit: limit.toString() },
    });
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
   * Search for movies
   */
  async searchMovies(query: string, page = 1) {
    return apiService.get<MovieListResponse>("/movies/search", {
      params: { search: query, page: page.toString() },
    });
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
