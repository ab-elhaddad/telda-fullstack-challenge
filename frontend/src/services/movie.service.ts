/**
 * Movie service for handling movie-related API requests
 */
import apiService from './api.service';
import { Movie, MovieDetails, WatchlistItem, WatchStatus } from '../types/movie.types';

/**
 * Service for handling movie-related operations
 */
class MovieService {
  /**
   * Get popular movies
   */
  async getPopularMovies(page = 1): Promise<{ movies: Movie[], totalPages: number }> {
    return apiService.get<{ movies: Movie[], totalPages: number }>('/movies/popular', {
      params: { page: page.toString() }
    });
  }

  /**
   * Get movie details by ID
   */
  async getMovieById(id: number): Promise<MovieDetails> {
    return apiService.get<MovieDetails>(`/movies/${id}`);
  }

  /**
   * Search for movies
   */
  async searchMovies(query: string, page = 1): Promise<{ movies: Movie[], totalPages: number }> {
    return apiService.get<{ movies: Movie[], totalPages: number }>('/movies/search', {
      params: { query, page: page.toString() }
    });
  }

  /**
   * Get user's watchlist
   */
  async getWatchlist(): Promise<WatchlistItem[]> {
    return apiService.get<WatchlistItem[]>('/watchlist');
  }

  /**
   * Add movie to watchlist
   */
  async addToWatchlist(movieId: number, status: WatchStatus = WatchStatus.PLAN_TO_WATCH): Promise<WatchlistItem> {
    return apiService.post<WatchlistItem>('/watchlist', { movieId, status });
  }

  /**
   * Update watchlist item status
   */
  async updateWatchlistStatus(movieId: number, status: WatchStatus): Promise<WatchlistItem> {
    return apiService.put<WatchlistItem>(`/watchlist/${movieId}`, { status });
  }

  /**
   * Remove movie from watchlist
   */
  async removeFromWatchlist(movieId: number): Promise<void> {
    return apiService.delete<void>(`/watchlist/${movieId}`);
  }
}

export const movieService = new MovieService();
export default movieService;
