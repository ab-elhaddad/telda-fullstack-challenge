// Required to fix TypeScript errors for Jest globals
// @ts-ignore - Jest globals are provided by the test environment
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

// First import the mock and set up the mocking
import mockDb from '../../mocks/database.mock';

// Mock the database module before importing the model that uses it
jest.mock('../../../src/config/database', () => mockDb);

// Now import the model and any needed types
import WatchlistModel from '../../../src/models/watchlist.model';
import { 
  Watchlist, 
  WatchlistWithMovie, 
  AddToWatchlistDto, 
  UpdateWatchlistDto 
} from '../../../src/types/watchlist';
import { NotFoundException, BadRequestException } from '../../../src/utils/exceptions';

describe('WatchlistModel', () => {
  const userId = 1;
  const movieId = 2;
  
  // Mock watchlist data
  const mockWatchlistItem: Watchlist = {
    id: 1,
    user_id: userId,
    movie_id: movieId,
    added_at: new Date(),
    status: 'to_watch'
  };
  
  // Mock watchlist item with movie details
  const mockWatchlistWithMovie: WatchlistWithMovie = {
    ...mockWatchlistItem,
    title: 'Test Movie',
    director: 'Test Director',
    poster: '/test.jpg',
    rating: 8.5,
    release_year: 2023,
    genre: 'Action'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('addToWatchlist', () => {
    it('should add a movie to watchlist when movie exists and not in watchlist', async () => {
      // Arrange
      const addToWatchlistDto: AddToWatchlistDto = { movie_id: movieId };
      
      // Mock checkMovieExists query
      mockDb.query.mockResolvedValueOnce([{ exists: true }]);
      // Mock existing items check
      mockDb.query.mockResolvedValueOnce([]);
      // Mock insert into watchlist
      mockDb.query.mockResolvedValueOnce([mockWatchlistItem]);
      
      // Act
      const result = await WatchlistModel.addToWatchlist(userId, addToWatchlistDto);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledTimes(3);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT EXISTS.+FROM movies WHERE id = \$1/),
        [movieId]
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT id FROM watchlist WHERE user_id = \$1 AND movie_id = \$2/),
        [userId, movieId]
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO watchlist.+VALUES \(\$1, \$2, \$3\) RETURNING/),
        [userId, movieId, 'to_watch']
      );
      expect(result).toEqual(mockWatchlistItem);
    });

    it('should use provided status when adding to watchlist', async () => {
      // Arrange
      const addToWatchlistDto: AddToWatchlistDto = { 
        movie_id: movieId,
        status: 'watched' as const
      };
      const watchlistItemWithStatus = {
        ...mockWatchlistItem,
        status: 'watched'
      };
      
      // Mock checkMovieExists query
      mockDb.query.mockResolvedValueOnce([{ exists: true }]);
      // Mock existing items check
      mockDb.query.mockResolvedValueOnce([]);
      // Mock insert into watchlist
      mockDb.query.mockResolvedValueOnce([watchlistItemWithStatus]);
      
      // Act
      const result = await WatchlistModel.addToWatchlist(userId, addToWatchlistDto);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledTimes(3);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO watchlist.+VALUES \(\$1, \$2, \$3\) RETURNING/),
        [userId, movieId, 'watched']
      );
      expect(result).toEqual(watchlistItemWithStatus);
    });
    
    it('should throw NotFoundException when movie does not exist', async () => {
      // Arrange
      const addToWatchlistDto: AddToWatchlistDto = { movie_id: 999 };
      mockDb.query.mockResolvedValueOnce([{ exists: false }]);
      
      // Act & Assert
      await expect(WatchlistModel.addToWatchlist(userId, addToWatchlistDto))
        .rejects.toThrow(NotFoundException);
      
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
    
    it('should throw BadRequestException when movie is already in watchlist', async () => {
      // Arrange
      const addToWatchlistDto: AddToWatchlistDto = { movie_id: movieId };
      mockDb.query.mockResolvedValueOnce([{ exists: true }]);
      mockDb.query.mockResolvedValueOnce([{ id: 1 }]);
      
      // Act & Assert
      await expect(WatchlistModel.addToWatchlist(userId, addToWatchlistDto))
        .rejects.toThrow(BadRequestException);
      
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('updateWatchlistStatus', () => {
    it('should update watchlist status when item exists', async () => {
      // Arrange
      const updateData: UpdateWatchlistDto = { status: 'watched' as const };
      const updatedItem = { ...mockWatchlistItem, status: 'watched' };
      
      // Mock check if item exists
      mockDb.query.mockResolvedValueOnce([{ id: 1 }]);
      // Mock update query
      mockDb.query.mockResolvedValueOnce([updatedItem]);
      
      // Act
      const result = await WatchlistModel.updateWatchlistStatus(userId, movieId, updateData);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT id FROM watchlist WHERE user_id = \$1 AND movie_id = \$2/),
        [userId, movieId]
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE watchlist SET status = \$1 WHERE user_id = \$2 AND movie_id = \$3 RETURNING/),
        ['watched', userId, movieId]
      );
      expect(result).toEqual(updatedItem);
    });
    
    it('should throw NotFoundException when item does not exist', async () => {
      // Arrange
      const updateData: UpdateWatchlistDto = { status: 'watched' as const };
      
      // Mock empty result for item existence check with the correct format
      mockDb.query.mockImplementationOnce((_query: string, _params: any[]) => {
        return Promise.resolve({ rowCount: 0 });
      });
      
      // Act & Assert
      await expect(WatchlistModel.updateWatchlistStatus(userId, movieId, updateData))
        .rejects.toThrow(NotFoundException);
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT id FROM watchlist WHERE user_id = \$1 AND movie_id = \$2/),
        [userId, movieId]
      );
    });
  });
  
  describe('getUserWatchlist', () => {
    it('should return watchlist with pagination metadata', async () => {
      // Arrange
      const params = { page: 1, limit: 10 };
      
      // Mock watchlist items query
      mockDb.query.mockResolvedValueOnce([mockWatchlistWithMovie]);
      // Mock count query
      mockDb.query.mockResolvedValueOnce([{ count: '1' }]);
      
      // Act
      const result = await WatchlistModel.getUserWatchlist(userId, params);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT.*FROM watchlist w.*JOIN movies m.*WHERE w\.user_id = \$1/s),
        expect.arrayContaining([userId, 10, 0])
      );
      expect(result).toEqual({
        watchlist: [mockWatchlistWithMovie],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1
        }
      });
    });
    
    it('should handle status filter', async () => {
      // Arrange
      const params = { page: 1, limit: 10, status: 'to_watch' as const };
      
      // Mock watchlist items query
      mockDb.query.mockResolvedValueOnce([mockWatchlistWithMovie]);
      // Mock count query
      mockDb.query.mockResolvedValueOnce([{ count: '1' }]);
      
      // Act
      await WatchlistModel.getUserWatchlist(userId, params);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT.*FROM watchlist w.*WHERE w\.user_id = \$1.*AND w\.status = \$2/s),
        expect.arrayContaining([userId, 'to_watch', 10, 0])
      );
    });
    
    it('should handle custom sorting', async () => {
      // Arrange
      const params = {
        page: 1,
        limit: 10,
        sort_by: 'rating',
        order: 'DESC' as const
      };
      
      // Mock database responses
      mockDb.query.mockResolvedValueOnce([mockWatchlistWithMovie]);
      mockDb.query.mockResolvedValueOnce([{ count: '1' }]);
      
      // Act
      await WatchlistModel.getUserWatchlist(userId, params);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/ORDER BY m\.rating DESC/),
        expect.anything()
      );
    });
    
    it('should default to added_at sort when invalid sort field provided', async () => {
      // Arrange
      const params = {
        page: 1,
        limit: 10,
        sort_by: 'invalid_field',
        order: 'ASC' as const
      };
      
      // Mock database responses
      mockDb.query.mockResolvedValueOnce([mockWatchlistWithMovie]);
      mockDb.query.mockResolvedValueOnce([{ count: '1' }]);
      
      // Act
      await WatchlistModel.getUserWatchlist(userId, params);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/ORDER BY w\.added_at ASC/),
        expect.anything()
      );
    });
  });
  
  describe('isInWatchlist', () => {
    it('should return true when movie is in watchlist', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([{ exists: true }]);
      
      // Act
      const result = await WatchlistModel.isInWatchlist(userId, movieId);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT EXISTS.*FROM watchlist WHERE user_id = \$1 AND movie_id = \$2/),
        [userId, movieId]
      );
      expect(result).toBe(true);
    });
    
    it('should return false when movie is not in watchlist', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([{ exists: false }]);
      
      // Act
      const result = await WatchlistModel.isInWatchlist(userId, movieId);
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  describe('checkMovieInWatchlist', () => {
    it('should return inWatchlist true and status when movie is in watchlist', async () => {
      // Arrange
      // Need to simulate a different format for this specific method that uses rowCount
      mockDb.query.mockImplementationOnce((_query: string, _params: any[]) => {
        return Promise.resolve({
          rowCount: 1,
          rows: [{ status: 'to_watch' }]
        });
      });
      
      // Act
      const result = await WatchlistModel.checkMovieInWatchlist(userId, movieId);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT status FROM watchlist WHERE user_id = \$1 AND movie_id = \$2/),
        [userId, movieId]
      );
      expect(result).toEqual({
        inWatchlist: true,
        status: 'to_watch'
      });
    });
    
    it('should return inWatchlist false and undefined status when movie is not in watchlist', async () => {
      // Arrange
      mockDb.query.mockImplementationOnce((_query: string, _params: any[]) => {
        return Promise.resolve({
          rowCount: 0,
          rows: []
        });
      });
      
      // Act
      const result = await WatchlistModel.checkMovieInWatchlist(userId, movieId);
      
      // Assert
      expect(result).toEqual({
        inWatchlist: false,
        status: undefined
      });
    });
  });
  
  describe('removeFromWatchlist', () => {
    it('should remove movie from watchlist when it exists', async () => {
      // Arrange
      // Mock isInWatchlist to return true
      mockDb.query.mockResolvedValueOnce([{ exists: true }]);
      // Mock delete query
      mockDb.query.mockImplementationOnce((_query: string, _params: any[]) => {
        return Promise.resolve({ rowCount: 1 });
      });
      
      // Act
      const result = await WatchlistModel.removeFromWatchlist(userId, movieId);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/DELETE FROM watchlist WHERE user_id = \$1 AND movie_id = \$2/),
        [userId, movieId]
      );
      expect(result).toBe(true);
    });
    
    it('should throw NotFoundException when movie is not in watchlist', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([{ exists: false }]);
      
      // Act & Assert
      await expect(WatchlistModel.removeFromWatchlist(userId, movieId))
        .rejects.toThrow(NotFoundException);
    });
  });
});
