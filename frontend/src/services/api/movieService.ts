import apiClient from './apiClient';
import { 
  Movie, 
  MovieListResponse, 
  CreateMovieData, 
  UpdateMovieData,
  MovieQueryParams,
  MovieSearchParams
} from '@/types/movie';

/**
 * Movie service for handling movie CRUD operations and search
 */
class MovieService {
  private MOVIES_ENDPOINT = '/movies';
  
  /**
   * Get a list of movies with filtering and pagination
   * @param queryParams Parameters to filter, sort and paginate movies
   * @returns List of movies and pagination info
   */
  async getMovies(queryParams: MovieQueryParams = {}): Promise<MovieListResponse> {
    return await apiClient.get<MovieListResponse>(this.MOVIES_ENDPOINT, { 
      params: queryParams 
    });
  }
  
  /**
   * Search movies with a simple query string
   * @param searchParams Search parameters
   * @returns List of movies and pagination info
   */
  async searchMovies(searchParams: MovieSearchParams = {}): Promise<MovieListResponse> {
    return await apiClient.get<MovieListResponse>(`${this.MOVIES_ENDPOINT}/search`, { 
      params: searchParams 
    });
  }
  
  /**
   * Get a single movie by ID
   * @param id Movie ID
   * @returns Movie details
   */
  async getMovieById(id: number): Promise<Movie> {
    return await apiClient.get<Movie>(`${this.MOVIES_ENDPOINT}/${id}`);
  }
  
  /**
   * Create a new movie (requires authentication)
   * @param movieData Movie data to create
   * @returns Created movie
   */
  async createMovie(movieData: CreateMovieData): Promise<Movie> {
    return await apiClient.post<Movie>(this.MOVIES_ENDPOINT, movieData);
  }
  
  /**
   * Update an existing movie (requires authentication)
   * @param id Movie ID
   * @param movieData Movie data to update
   * @returns Updated movie
   */
  async updateMovie(id: number, movieData: UpdateMovieData): Promise<Movie> {
    return await apiClient.put<Movie>(`${this.MOVIES_ENDPOINT}/${id}`, movieData);
  }
  
  /**
   * Delete a movie (requires authentication)
   * @param id Movie ID
   * @returns Success indicator
   */
  async deleteMovie(id: number): Promise<void> {
    await apiClient.delete(`${this.MOVIES_ENDPOINT}/${id}`);
  }
  
  /**
   * Get movie genres for filtering
   * @returns List of unique genres
   */
  async getGenres(): Promise<string[]> {
    return await apiClient.get<string[]>(`${this.MOVIES_ENDPOINT}/genres`);
  }
}

// Create and export a singleton instance
const movieService = new MovieService();
export default movieService;
