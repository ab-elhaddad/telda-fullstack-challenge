import { MovieController } from '../../../src/controllers/movie.controller';
// Required to fix TypeScript errors for Jest globals
// @ts-ignore - Jest globals are provided by the test environment
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

import movieService from '../../../src/services/movie.service';
import { NotFoundException } from '../../../src/utils/exceptions';
import movieFixtures from '../../fixtures/movie.fixtures';

// Mock the movie service
jest.mock('../../../src/services/movie.service');

describe('MovieController', () => {
  let movieController: MovieController;
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock request, response and next function
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    
    // Instantiate controller
    movieController = new MovieController();
  });
  
  describe('getAllMovies', () => {
    it('should return movies with pagination metadata', async () => {
      // Arrange
      const mockMoviesResult = {
        movies: movieFixtures.movies,
        total: 10
      };
      
      // Setup mock query parameters
      mockRequest.query = {
        page: '1',
        limit: '10',
        sort_by: 'title',
        order: 'ASC'
      };
      
      // Mock service response
      (movieService.getAllMovies as any).mockResolvedValue(mockMoviesResult);
      
      // Act
      await movieController.getAllMovies(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(movieService.getAllMovies).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sort_by: 'title',
        order: 'ASC',
        search: undefined,
        title: undefined,
        genre: undefined,
        year: undefined,
        year_from: undefined,
        year_to: undefined,
        min_rating: undefined,
        max_rating: undefined
      });
      
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: true,
        message: 'Success',
        data: {
          movies: mockMoviesResult.movies,
          pagination: {
            total: 10,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          }
        }
      });
    });
    
    it('should handle errors and call next with error', async () => {
      // Arrange
      const error = new Error('Test error');
      mockRequest.query = {};
      (movieService.getAllMovies as any).mockRejectedValue(error);
      
      // Act
      await movieController.getAllMovies(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
  
  describe('getMovieById', () => {
    it('should return a movie when found', async () => {
      // Arrange
      const mockMovie = movieFixtures.movies[0];
      mockRequest.params = { id: '1' };
      (movieService.getMovieById as any).mockResolvedValue(mockMovie);
      
      // Act
      await movieController.getMovieById(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(movieService.getMovieById).toHaveBeenCalledWith('1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: true,
        message: 'Success',
        data: { movie: mockMovie }
      });
    });
    
    it('should call next with error when service throws', async () => {
      // Arrange
      const error = new NotFoundException('Movie');
      mockRequest.params = { id: '999' };
      (movieService.getMovieById as any).mockRejectedValue(error);
      
      // Act
      await movieController.getMovieById(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(movieService.getMovieById).toHaveBeenCalledWith('999');
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
  
  describe('createMovie', () => {
    it('should create a movie and return success response', async () => {
      // Arrange
      const mockMovie = movieFixtures.movies[0];
      mockRequest.body = movieFixtures.createMovieDto;
      (movieService.createMovie as any).mockResolvedValue(mockMovie);
      
      // Act
      await movieController.createMovie(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(movieService.createMovie).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: true,
        message: 'Resource created successfully',
        data: { movie: mockMovie }
      });
    });
  });
  
  describe('updateMovie', () => {
    it('should update a movie and return success response', async () => {
      // Arrange
      const mockUpdatedMovie = { ...movieFixtures.movies[0], ...movieFixtures.updateMovieDto };
      mockRequest.params = { id: '1' };
      mockRequest.body = movieFixtures.updateMovieDto;
      (movieService.updateMovie as any).mockResolvedValue(mockUpdatedMovie);
      
      // Act
      await movieController.updateMovie(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(movieService.updateMovie).toHaveBeenCalledWith('1', mockRequest.body);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: true,
        message: 'Success',
        data: { movie: mockUpdatedMovie }
      });
    });
  });
  
  describe('deleteMovie', () => {
    it('should delete a movie and return success response', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      (movieService.deleteMovie as any).mockResolvedValue(undefined);
      
      // Act
      await movieController.deleteMovie(mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(movieService.deleteMovie).toHaveBeenCalledWith('1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: true,
        message: 'Movie deleted successfully',
        data: null
      });
    });
  });
});
