// @ts-nocheck - Disable TypeScript errors for the entire file
import MovieModel from '../../../src/models/movie.model';
import { MovieService } from '../../../src/services/movie.service';
import { NotFoundException, BadRequestException } from '../../../src/utils/exceptions';
import { Movie, MovieQueryParams } from '../../../src/types/movie';
import logger from '../../../src/config/logger';

// Required to fix TypeScript errors for Jest globals
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

// Mock the movie model and logger - following principle of mocking only what's necessary
jest.mock('../../../src/models/movie.model');
jest.mock('../../../src/config/logger');

/**
 * Unit Tests for MovieService
 *
 * These tests verify the business logic in the movie service layer
 * by mocking its external dependencies (i.e., MovieModel).
 */
describe('MovieService', () => {
  // Test fixture data
  const mockMovies: Movie[] = [
    {
      id: '1',
      title: 'Test Movie 1',
      genre: 'Action',
      poster: '/test-poster-1.jpg',
      rating: 8.5,
      total_views: 100,
      created_at: new Date('2023-01-01T00:00:00Z'),
    },
    {
      id: '2',
      title: 'Test Movie 2',
      genre: 'Drama',
      poster: '/test-poster-2.jpg',
      rating: 7.5,
      total_views: 50,
      created_at: new Date('2023-02-02T00:00:00Z'),
    },
  ];

  // New movie data for creation tests
  const newMovieData = {
    title: 'New Test Movie',
    genre: 'Comedy',
    poster: '/new-test-poster.jpg',
    rating: 9.0,
    total_views: 0,
  };

  // Update movie data for update tests
  const updateMovieData = {
    title: 'Updated Movie Title',
    rating: 9.5,
    total_views: 0, // Adding required field from BaseMovie interface
  };

  let movieService: MovieService;
  const mockedMovieModel = MovieModel as jest.Mocked<typeof MovieModel>;

  beforeEach(() => {
    // Clear all mock implementations and calls between tests
    jest.clearAllMocks();
    movieService = new MovieService();
  });

  describe('getMovieById', () => {
    it('should return a movie when found', async () => {
      // Arrange: Set up the test with a movie that will be returned
      const mockMovie = mockMovies[0];
      mockedMovieModel.findById.mockResolvedValue(mockMovie);

      // Act: Call the service method
      const result = await movieService.getMovieById('1');

      // Assert: Verify the result and that the model was called correctly
      expect(result).toEqual(mockMovie);
      expect(mockedMovieModel.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when movie does not exist', async () => {
      // Arrange: Set up the test with no movie found
      mockedMovieModel.findById.mockResolvedValue(null);

      // Act & Assert: Verify that an error is thrown
      await expect(movieService.getMovieById('999')).rejects.toThrow(NotFoundException);

      expect(mockedMovieModel.findById).toHaveBeenCalledWith('999');
    });

    it('should log errors and rethrow when database query fails', async () => {
      // Arrange: Setup a database error
      const dbError = new Error('Database connection failed');
      mockedMovieModel.findById.mockRejectedValue(dbError);

      // Act & Assert: Verify error handling
      await expect(movieService.getMovieById('1')).rejects.toThrow(dbError);

      expect(logger.error).toHaveBeenCalled();
      expect(mockedMovieModel.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('getAllMovies', () => {
    it('should return movies and total count with default pagination', async () => {
      // Arrange: Setup mock response with pagination
      const mockMoviesResult = {
        movies: mockMovies,
        total: 2,
      };
      mockedMovieModel.findAll.mockResolvedValue(mockMoviesResult);
      const queryParams: MovieQueryParams = { page: 1, limit: 10 };

      // Act: Call service method
      const result = await movieService.getAllMovies(queryParams);

      // Assert: Verify correct response and model call
      expect(result).toEqual(mockMoviesResult);
      expect(mockedMovieModel.findAll).toHaveBeenCalledWith(queryParams);
    });

    it('should handle advanced search filters correctly', async () => {
      // Arrange: Setup complex query parameters
      const complexQueryParams: MovieQueryParams = {
        search: 'action',
        genre: 'Action',
        min_rating: 7,
        year_from: 2020,
        year_to: 2023,
        page: 2,
        limit: 5,
        sort_by: 'rating',
        order: 'DESC',
      };

      const mockMoviesResult = {
        movies: [mockMovies[0]],
        total: 1,
      };

      mockedMovieModel.findAll.mockResolvedValue(mockMoviesResult);

      // Act: Call service with complex params
      const result = await movieService.getAllMovies(complexQueryParams);

      // Assert: Verify all params were passed through
      expect(result).toEqual(mockMoviesResult);
      expect(mockedMovieModel.findAll).toHaveBeenCalledWith(complexQueryParams);
    });

    it('should handle and log database errors when fetching movies', async () => {
      // Arrange: Setup a database error
      const dbError = new Error('Database query failed');
      mockedMovieModel.findAll.mockRejectedValue(dbError);

      // Act & Assert: Verify error handling
      await expect(movieService.getAllMovies({})).rejects.toThrow(dbError);

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('createMovie', () => {
    it('should create and return a new movie with all fields', async () => {
      // Arrange: Setup new movie data and expected result
      const mockNewMovie = {
        ...newMovieData,
        id: '3',
        created_at: expect.any(Date),
      } as Movie;

      mockedMovieModel.create.mockResolvedValue(mockNewMovie);

      // Act: Call service to create movie
      const result = await movieService.createMovie(newMovieData);

      // Assert: Verify movie was created with correct data
      expect(result).toEqual(mockNewMovie);
      expect(mockedMovieModel.create).toHaveBeenCalledWith(newMovieData);
    });

    it('should handle validation or constraint errors during creation', async () => {
      // Arrange: Setup a validation error
      const validationError = new BadRequestException('Title is required');
      mockedMovieModel.create.mockRejectedValue(validationError);

      // Act & Assert: Verify error is propagated
      await expect(movieService.createMovie(newMovieData)).rejects.toThrow(BadRequestException);

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle and log unexpected errors during creation', async () => {
      // Arrange: Setup an unexpected error
      const unexpectedError = new Error('Unexpected database error');
      mockedMovieModel.create.mockRejectedValue(unexpectedError);

      // Act & Assert: Verify error handling
      await expect(movieService.createMovie(newMovieData)).rejects.toThrow(unexpectedError);

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateMovie', () => {
    it('should update and return the movie when it exists', async () => {
      // Arrange: Setup existing movie and update data
      const mockExistingMovie = mockMovies[0];
      const mockUpdatedMovie = {
        ...mockExistingMovie,
        ...updateMovieData,
        updated_at: expect.any(Date),
      };

      mockedMovieModel.findById.mockResolvedValue(mockExistingMovie);
      mockedMovieModel.update.mockResolvedValue(mockUpdatedMovie);

      // Act: Call service to update movie
      const result = await movieService.updateMovie('1', updateMovieData);

      // Assert: Verify update was successful
      expect(result).toEqual(mockUpdatedMovie);
      expect(mockedMovieModel.findById).toHaveBeenCalledWith('1');
      expect(mockedMovieModel.update).toHaveBeenCalledWith('1', updateMovieData);
    });

    it('should throw NotFoundException when movie to update does not exist', async () => {
      // Arrange: Setup scenario where movie doesn't exist
      mockedMovieModel.findById.mockResolvedValue(null);

      // Act & Assert: Verify correct error is thrown
      await expect(movieService.updateMovie('999', updateMovieData)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockedMovieModel.findById).toHaveBeenCalledWith('999');
      expect(mockedMovieModel.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when update operation fails', async () => {
      // Arrange: Setup movie exists but update fails
      const mockExistingMovie = mockMovies[0];

      mockedMovieModel.findById.mockResolvedValue(mockExistingMovie);
      mockedMovieModel.update.mockResolvedValue(null);

      // Act & Assert: Verify correct error is thrown
      await expect(movieService.updateMovie('1', updateMovieData)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockedMovieModel.findById).toHaveBeenCalledWith('1');
      expect(mockedMovieModel.update).toHaveBeenCalledWith('1', updateMovieData);
    });

    it('should handle and log unexpected errors during update', async () => {
      // Arrange: Setup unexpected error during update
      const mockExistingMovie = mockMovies[0];
      const unexpectedError = new Error('Database error during update');

      mockedMovieModel.findById.mockResolvedValue(mockExistingMovie);
      mockedMovieModel.update.mockRejectedValue(unexpectedError);

      // Act & Assert: Verify error handling
      await expect(movieService.updateMovie('1', updateMovieData)).rejects.toThrow(unexpectedError);

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteMovie', () => {
    it('should successfully delete a movie when it exists', async () => {
      // Arrange: Setup movie exists and delete succeeds
      mockedMovieModel.findById.mockResolvedValue(mockMovies[0]);
      mockedMovieModel.delete.mockResolvedValue(true);

      // Act: Call service to delete
      await movieService.deleteMovie('1');

      // Assert: Verify delete was called with correct ID
      expect(mockedMovieModel.findById).toHaveBeenCalledWith('1');
      expect(mockedMovieModel.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when movie to delete does not exist', async () => {
      // Arrange: Setup movie doesn't exist
      mockedMovieModel.findById.mockResolvedValue(null);

      // Act & Assert: Verify correct error is thrown
      await expect(movieService.deleteMovie('999')).rejects.toThrow(NotFoundException);

      expect(mockedMovieModel.findById).toHaveBeenCalledWith('999');
      expect(mockedMovieModel.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when delete operation fails', async () => {
      // Arrange: Setup movie exists but delete fails
      mockedMovieModel.findById.mockResolvedValue(mockMovies[0]);
      mockedMovieModel.delete.mockResolvedValue(false);

      // Act & Assert: Verify correct error is thrown
      await expect(movieService.deleteMovie('1')).rejects.toThrow(BadRequestException);

      expect(mockedMovieModel.findById).toHaveBeenCalledWith('1');
      expect(mockedMovieModel.delete).toHaveBeenCalledWith('1');
    });

    it('should handle database constraint violations during delete', async () => {
      // Arrange: Setup constraint violation error
      mockedMovieModel.findById.mockResolvedValue(mockMovies[0]);
      const constraintError = new Error('Foreign key constraint violation');
      mockedMovieModel.delete.mockRejectedValue(constraintError);

      // Act & Assert: Verify error handling
      await expect(movieService.deleteMovie('1')).rejects.toThrow(constraintError);

      expect(logger.error).toHaveBeenCalled();
    });
  });
});
