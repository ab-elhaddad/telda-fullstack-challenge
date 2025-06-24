// @ts-nocheck - Disable TypeScript errors for the entire file
import WatchlistModel from '../../../src/models/watchlist.model';
import watchlistService from '../../../src/services/watchlist.service';
import { NotFoundException, BadRequestException } from '../../../src/utils/exceptions';
import { Watchlist, WatchlistWithMovie } from '../../../src/types/watchlist';

// Required to fix TypeScript errors for Jest globals
// @ts-ignore - Jest globals are provided by the test environment
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

// Mock the watchlist model and logger - following principle of mocking only what's necessary
jest.mock('../../../src/models/watchlist.model');
jest.mock('../../../src/config/logger');

/**
 * Unit Tests for WatchlistService
 *
 * These tests verify the business logic in the watchlist service layer
 * by mocking its external dependencies (i.e., WatchlistModel).
 */
describe('WatchlistService', () => {
  // Test fixture data
  const userId = 1;
  const movieId = 2;

  // Mock watchlist item
  const mockWatchlistItem: Watchlist = {
    id: 1,
    user_id: userId,
    movie_id: movieId,
    status: 'to_watch',
    added_at: new Date('2023-01-01T00:00:00Z'),
  };

  // Mock watchlist item with movie details
  const mockWatchlistWithMovie: WatchlistWithMovie = {
    ...mockWatchlistItem,
    title: 'Test Movie',
    director: 'Test Director', // Adding required director field
    poster: '/test-poster.jpg',
    rating: 8.5,
    release_year: 2023,
    genre: 'Action',
  };

  // Mock watchlist response with pagination
  const mockWatchlistResponse = {
    watchlist: [mockWatchlistWithMovie],
    pagination: {
      total: 1,
      page: 1,
      limit: 10,
      pages: 1,
    },
  };

  // Mock watchlist model
  const mockedWatchlistModel = WatchlistModel as jest.Mocked<typeof WatchlistModel>;

  beforeEach(() => {
    // Clear all mock implementations and calls between tests
    jest.clearAllMocks();
  });

  describe('addToWatchlist', () => {
    it('should add a movie to the watchlist and return the watchlist item', async () => {
      // Arrange: Setup mocked successful response
      const addToWatchlistDto = { movie_id: movieId };
      mockedWatchlistModel.addToWatchlist.mockResolvedValue(mockWatchlistItem);

      // Act: Call service method
      const result = await watchlistService.addToWatchlist(userId, addToWatchlistDto);

      // Assert: Verify result and that the model was called with correct parameters
      expect(result).toEqual(mockWatchlistItem);
      expect(mockedWatchlistModel.addToWatchlist).toHaveBeenCalledWith(userId, addToWatchlistDto);
    });

    it('should pass through explicit status when provided', async () => {
      // Arrange: Setup dto with explicit status
      const addToWatchlistDto = { movie_id: movieId, status: 'watched' as const };
      const expectedResult = { ...mockWatchlistItem, status: 'watched' as const };
      mockedWatchlistModel.addToWatchlist.mockResolvedValue(expectedResult);

      // Act: Call service method
      const result = await watchlistService.addToWatchlist(userId, addToWatchlistDto);

      // Assert: Verify status was passed through
      expect(result).toEqual(expectedResult);
      expect(mockedWatchlistModel.addToWatchlist).toHaveBeenCalledWith(userId, addToWatchlistDto);
    });

    it('should throw NotFoundException when movie does not exist', async () => {
      // Arrange: Setup model to throw NotFoundException
      const addToWatchlistDto = { movie_id: 999 };
      const error = new NotFoundException('Movie');
      mockedWatchlistModel.addToWatchlist.mockRejectedValue(error);

      // Act & Assert: Verify error is propagated
      await expect(watchlistService.addToWatchlist(userId, addToWatchlistDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockedWatchlistModel.addToWatchlist).toHaveBeenCalledWith(userId, addToWatchlistDto);
    });

    it('should throw BadRequestException when movie is already in watchlist', async () => {
      // Arrange: Setup model to throw BadRequestException
      const addToWatchlistDto = { movie_id: movieId };
      const error = new BadRequestException('Movie is already in your watchlist');
      mockedWatchlistModel.addToWatchlist.mockRejectedValue(error);

      // Act & Assert: Verify error is propagated
      await expect(watchlistService.addToWatchlist(userId, addToWatchlistDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockedWatchlistModel.addToWatchlist).toHaveBeenCalledWith(userId, addToWatchlistDto);
    });
  });

  describe('getUserWatchlist', () => {
    it('should return watchlist with default pagination', async () => {
      // Arrange: Setup mock response
      const queryParams = { page: 1, limit: 10 };
      mockedWatchlistModel.getUserWatchlist.mockResolvedValue(mockWatchlistResponse);

      // Act: Call service method
      const result = await watchlistService.getUserWatchlist(userId, queryParams);

      // Assert: Verify result and model call
      expect(result).toEqual(mockWatchlistResponse);
      expect(mockedWatchlistModel.getUserWatchlist).toHaveBeenCalledWith(userId, queryParams);
    });

    it('should handle filtering by status', async () => {
      // Arrange: Setup query with status filter
      const queryParams = { page: 1, limit: 10, status: 'watched' as const };
      mockedWatchlistModel.getUserWatchlist.mockResolvedValue({
        ...mockWatchlistResponse,
        watchlist: [{ ...mockWatchlistWithMovie, status: 'watched' as const }],
      });

      // Act: Call service with status filter
      const result = await watchlistService.getUserWatchlist(userId, queryParams);

      // Assert: Verify query params were passed through
      expect(result.watchlist[0].status).toBe('watched');
      expect(mockedWatchlistModel.getUserWatchlist).toHaveBeenCalledWith(userId, queryParams);
    });

    it('should handle sorting and custom pagination', async () => {
      // Arrange: Setup complex query params
      const queryParams = {
        page: 2,
        limit: 5,
        sort_by: 'rating',
        order: 'DESC' as const,
      };

      mockedWatchlistModel.getUserWatchlist.mockResolvedValue({
        watchlist: [mockWatchlistWithMovie],
        pagination: {
          total: 8,
          page: 2,
          limit: 5,
          pages: 2,
        },
      });

      // Act: Call service with complex params
      const result = await watchlistService.getUserWatchlist(userId, queryParams);

      // Assert: Verify pagination details
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(mockedWatchlistModel.getUserWatchlist).toHaveBeenCalledWith(userId, queryParams);
    });

    it('should handle and propagate database errors', async () => {
      // Arrange: Setup database error
      const queryParams = { page: 1, limit: 10 };
      const dbError = new Error('Database query failed');
      mockedWatchlistModel.getUserWatchlist.mockRejectedValue(dbError);

      // Act & Assert: Verify error handling
      await expect(watchlistService.getUserWatchlist(userId, queryParams)).rejects.toThrow(dbError);
    });
  });

  describe('removeFromWatchlist', () => {
    it('should successfully remove a movie from watchlist', async () => {
      // Arrange: Setup successful removal
      mockedWatchlistModel.removeFromWatchlist.mockResolvedValue(true);

      // Act: Call service to remove item
      const result = await watchlistService.removeFromWatchlist(userId, movieId);

      // Assert: Verify success and correct parameters
      expect(result).toBe(true);
      expect(mockedWatchlistModel.removeFromWatchlist).toHaveBeenCalledWith(userId, movieId);
    });

    it('should propagate false when removal fails', async () => {
      // Arrange: Setup failed removal
      mockedWatchlistModel.removeFromWatchlist.mockResolvedValue(false);

      // Act: Call service
      const result = await watchlistService.removeFromWatchlist(userId, movieId);

      // Assert: Verify failure result
      expect(result).toBe(false);
      expect(mockedWatchlistModel.removeFromWatchlist).toHaveBeenCalledWith(userId, movieId);
    });

    it('should handle and propagate errors', async () => {
      // Arrange: Setup error
      const error = new NotFoundException('Movie not found in watchlist');
      mockedWatchlistModel.removeFromWatchlist.mockRejectedValue(error);

      // Act & Assert: Verify error propagation
      await expect(watchlistService.removeFromWatchlist(userId, movieId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateWatchlistStatus', () => {
    it('should update watchlist item status successfully', async () => {
      // Arrange: Setup successful update
      const updateData = { status: 'watched' as const };
      const updatedItem = { ...mockWatchlistItem, status: 'watched' as const };
      mockedWatchlistModel.updateWatchlistStatus.mockResolvedValue(updatedItem);

      // Act: Call service to update status
      const result = await watchlistService.updateWatchlistStatus(userId, movieId, updateData);

      // Assert: Verify update was successful with correct status
      expect(result).toEqual(updatedItem);
      expect(result?.status).toBe('watched');
      expect(mockedWatchlistModel.updateWatchlistStatus).toHaveBeenCalledWith(
        userId,
        movieId,
        updateData,
      );
    });

    it('should return null when update fails', async () => {
      // Arrange: Setup update fails
      const updateData = { status: 'watched' as const };
      mockedWatchlistModel.updateWatchlistStatus.mockResolvedValue(null);

      // Act: Call service
      const result = await watchlistService.updateWatchlistStatus(userId, movieId, updateData);

      // Assert: Verify null result
      expect(result).toBeNull();
      expect(mockedWatchlistModel.updateWatchlistStatus).toHaveBeenCalledWith(
        userId,
        movieId,
        updateData,
      );
    });

    it('should throw NotFoundException when item does not exist in watchlist', async () => {
      // Arrange: Setup not found scenario
      const updateData = { status: 'watched' as const };
      const error = new NotFoundException('Movie not found in your watchlist');
      mockedWatchlistModel.updateWatchlistStatus.mockRejectedValue(error);

      // Act & Assert: Verify error propagation
      await expect(
        watchlistService.updateWatchlistStatus(userId, movieId, updateData),
      ).rejects.toThrow(NotFoundException);

      expect(mockedWatchlistModel.updateWatchlistStatus).toHaveBeenCalledWith(
        userId,
        movieId,
        updateData,
      );
    });

    it('should handle and propagate unexpected errors', async () => {
      // Arrange: Setup unexpected error
      const updateData = { status: 'watched' as const };
      const error = new Error('Database error');
      mockedWatchlistModel.updateWatchlistStatus.mockRejectedValue(error);

      // Act & Assert: Verify error propagation
      await expect(
        watchlistService.updateWatchlistStatus(userId, movieId, updateData),
      ).rejects.toThrow(error);
    });
  });
});
