// @ts-nocheck - Disable TypeScript errors for the entire file

import watchlistController from '../../../src/controllers/watchlist.controller';
import watchlistService from '../../../src/services/watchlist.service';
import { NotFoundException, BadRequestException } from '../../../src/utils/exceptions';

// Required to fix TypeScript errors for Jest globals
// @ts-ignore - Jest globals are provided by the test environment
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

// Mock the watchlist service
jest.mock('../../../src/services/watchlist.service');

describe('WatchlistController', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock request, response and next function
    mockRequest = {
      user: { id: 1, role: 'user' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('addToWatchlist', () => {
    it('should add a movie to watchlist and return created response', async () => {
      // Arrange
      const watchlistData = { movie_id: 1, status: 'to_watch' as const };
      const mockWatchlistItem = {
        id: 1,
        user_id: 1,
        movie_id: 1,
        status: 'to_watch',
        added_at: new Date(),
      };

      mockRequest.body = watchlistData;
      (watchlistService.addToWatchlist as jest.Mock).mockResolvedValue(mockWatchlistItem);

      // Act
      await watchlistController.addToWatchlist(mockRequest, mockResponse, mockNext);

      // Assert
      expect(watchlistService.addToWatchlist).toHaveBeenCalledWith(1, watchlistData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: true,
        message: 'Movie added to watchlist successfully',
        data: { watchlistItem: mockWatchlistItem },
      });
    });

    it('should handle errors when adding to watchlist', async () => {
      // Arrange
      const error = new BadRequestException('Movie is already in your watchlist');
      mockRequest.body = { movie_id: 1 };
      (watchlistService.addToWatchlist as jest.Mock).mockRejectedValue(error);

      // Act
      await watchlistController.addToWatchlist(mockRequest, mockResponse, mockNext);

      // Assert
      expect(watchlistService.addToWatchlist).toHaveBeenCalledWith(1, { movie_id: 1 });
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserWatchlist', () => {
    it('should return user watchlist with default pagination', async () => {
      // Arrange
      const mockWatchlistItems = [
        {
          id: 1,
          user_id: 1,
          movie_id: 1,
          status: 'to_watch',
          added_at: new Date(),
          title: 'Test Movie',
          director: 'Test Director',
          poster: '/test.jpg',
          rating: 8.5,
          release_year: 2023,
          genre: 'Action',
        },
      ];

      const mockWatchlistResult = {
        watchlist: mockWatchlistItems,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1,
        },
      };

      mockRequest.query = { page: '1', limit: '10' };
      (watchlistService.getUserWatchlist as jest.Mock).mockResolvedValue(mockWatchlistResult);

      // Act
      await watchlistController.getUserWatchlist(mockRequest, mockResponse, mockNext);

      // Assert
      expect(watchlistService.getUserWatchlist).toHaveBeenCalledWith(1, {
        page: 1,
        limit: 10,
        status: 'all',
        sort_by: 'added_at',
        order: 'DESC',
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: true,
        message: 'Watchlist retrieved successfully',
        data: mockWatchlistResult,
      });
    });

    it('should handle filtering by status', async () => {
      // Arrange
      mockRequest.query = {
        page: '1',
        limit: '10',
        status: 'watched',
      };

      const mockResult = {
        watchlist: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 },
      };

      (watchlistService.getUserWatchlist as jest.Mock).mockResolvedValue(mockResult);

      // Act
      await watchlistController.getUserWatchlist(mockRequest, mockResponse, mockNext);

      // Assert
      expect(watchlistService.getUserWatchlist).toHaveBeenCalledWith(1, {
        page: 1,
        limit: 10,
        status: 'watched',
        sort_by: 'added_at',
        order: 'DESC',
      });
    });

    it('should handle sorting and ordering options', async () => {
      // Arrange
      mockRequest.query = {
        sort_by: 'rating',
        order: 'asc',
      };

      const mockResult = {
        watchlist: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 },
      };

      (watchlistService.getUserWatchlist as jest.Mock).mockResolvedValue(mockResult);

      // Act
      await watchlistController.getUserWatchlist(mockRequest, mockResponse, mockNext);

      // Assert
      expect(watchlistService.getUserWatchlist).toHaveBeenCalledWith(1, {
        page: 1,
        limit: 10,
        status: 'all',
        sort_by: 'rating',
        order: 'ASC',
      });
    });

    it('should handle errors when getting watchlist', async () => {
      // Arrange
      const error = new Error('Database error');
      mockRequest.query = {};
      (watchlistService.getUserWatchlist as jest.Mock).mockRejectedValue(error);

      // Act
      await watchlistController.getUserWatchlist(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('removeFromWatchlist', () => {
    it('should remove a movie from watchlist', async () => {
      // Arrange
      mockRequest.params = { movieId: '1' };
      (watchlistService.removeFromWatchlist as jest.Mock).mockResolvedValue(true);

      // Act
      await watchlistController.removeFromWatchlist(mockRequest, mockResponse, mockNext);

      // Assert
      expect(watchlistService.removeFromWatchlist).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: true,
        message: 'Movie removed from watchlist successfully',
        data: {},
      });
    });

    it('should handle not found errors when removing', async () => {
      // Arrange
      const error = new NotFoundException('Movie not found in watchlist');
      mockRequest.params = { movieId: '999' };
      (watchlistService.removeFromWatchlist as jest.Mock).mockRejectedValue(error);

      // Act
      await watchlistController.removeFromWatchlist(mockRequest, mockResponse, mockNext);

      // Assert
      expect(watchlistService.removeFromWatchlist).toHaveBeenCalledWith(1, 999);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateWatchlistStatus', () => {
    it('should update watchlist status successfully', async () => {
      // Arrange
      const updateData = { status: 'watched' as const };
      const mockUpdatedItem = {
        id: 1,
        user_id: 1,
        movie_id: 1,
        status: 'watched',
        added_at: new Date(),
      };

      mockRequest.params = { movieId: '1' };
      mockRequest.body = updateData;
      (watchlistService.updateWatchlistStatus as jest.Mock).mockResolvedValue(mockUpdatedItem);

      // Act
      await watchlistController.updateWatchlistStatus(mockRequest, mockResponse, mockNext);

      // Assert
      expect(watchlistService.updateWatchlistStatus).toHaveBeenCalledWith(1, 1, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: true,
        message: 'Watchlist status updated successfully',
        data: { watchlistItem: mockUpdatedItem },
      });
    });

    it('should handle errors when updating status', async () => {
      // Arrange
      const error = new NotFoundException('Movie not found in your watchlist');
      mockRequest.params = { movieId: '999' };
      mockRequest.body = { status: 'watched' as const };
      (watchlistService.updateWatchlistStatus as jest.Mock).mockRejectedValue(error);

      // Act
      await watchlistController.updateWatchlistStatus(mockRequest, mockResponse, mockNext);

      // Assert
      expect(watchlistService.updateWatchlistStatus).toHaveBeenCalledWith(1, 999, {
        status: 'watched',
      });
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
