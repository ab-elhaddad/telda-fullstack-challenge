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

// Now import the model and fixtures
import MovieModel from '../../../src/models/movie.model';
import movieFixtures from '../../fixtures/movie.fixtures';

describe('MovieModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('findById', () => {
    it('should call database with correct query and return movie', async () => {
      // Arrange
      const mockMovie = movieFixtures.movies[0];
      mockDb.query.mockResolvedValueOnce([mockMovie]);
      
      // Act
      const result = await MovieModel.findById('1');
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT.*FROM\s+movies.*WHERE\s+id\s*=\s*\$/i),
        ['1']
      );
      expect(result).toEqual(mockMovie);
    });
    
    it('should return null when no movie is found', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([]);
      
      // Act
      const result = await MovieModel.findById('999');
      
      // Assert
      expect(result).toBeNull();
    });
  });
  
  describe('findAll', () => {
    it('should handle basic pagination parameters', async () => {
      // Arrange
      const mockMovies = movieFixtures.movies;
      // First mock the count query, then the movies query to match the implementation order
      mockDb.query.mockResolvedValueOnce([{ count: '10' }]).mockResolvedValueOnce(mockMovies);
      const queryParams = { page: 1, limit: 10 };
      
      // Act
      const result = await MovieModel.findAll(queryParams);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        movies: mockMovies,
        total: 10
      });
    });
    
    it('should handle search parameters', async () => {
      // Arrange
      const mockMovies = movieFixtures.movies;
      mockDb.query.mockResolvedValueOnce([{ count: '2' }]).mockResolvedValueOnce(mockMovies);
      const queryParams = {
        search: 'test',
        page: 1,
        limit: 10
      };
      
      // Act
      const result = await MovieModel.findAll(queryParams);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledTimes(2);
      // Let's just check that one of the calls includes our search term
      // rather than trying to specify exactly which query was called first
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT COUNT\(\*\) FROM movies WHERE 1=1 AND \(title ILIKE \$1 OR genre ILIKE \$1\)/),
        expect.arrayContaining(['%test%'])
      );
      expect(result.movies).toEqual(mockMovies);
      expect(result.total).toEqual(2);
    });
    
    it('should handle specific field filters', async () => {
      // Arrange
      const mockMovies = [movieFixtures.movies[0]];
      mockDb.query
        .mockResolvedValueOnce([{ count: '1' }])
        .mockResolvedValueOnce(mockMovies);
        
      const queryParams = {
        title: 'Test Movie 1',
        genre: 'Action',
        page: 1,
        limit: 10
      };
      
      // Act
      const result = await MovieModel.findAll(queryParams);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(result.movies).toEqual(mockMovies);
      expect(result.total).toEqual(1);
    });
  });
  
  describe('create', () => {
    it('should insert a movie and return the created movie', async () => {
      // Arrange
      const mockMovie = movieFixtures.movies[0];
      const createMovieDto = movieFixtures.createMovieDto;
      mockDb.query.mockResolvedValueOnce([mockMovie]);
      
      // Act
      const result = await MovieModel.create(createMovieDto);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT\s+INTO\s+movies/i),
        expect.any(Array)
      );
      expect(result).toEqual(mockMovie);
    });
  });
  
  describe('update', () => {
    it('should update a movie and return the updated movie', async () => {
      // Arrange
      // Create a complete BaseMovie by spreading the original movie first, then the update DTO
      const mockUpdatedMovie = { ...movieFixtures.movies[0], ...movieFixtures.updateMovieDto };
      // Use cast to BaseMovie since model.update requires a complete BaseMovie
      const completeMovieData = {
        title: 'Updated Movie Title',
        release_year: 2023,
        genre: 'Action',
        poster: '/test-poster-1.jpg',
        rating: 9.5,
        total_views: 10
      }; // This is a complete BaseMovie, not just the partial fields
      mockDb.query.mockResolvedValueOnce([mockUpdatedMovie]);
      
      // Act
      const result = await MovieModel.update('1', completeMovieData);
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE\s+movies\s+SET/i),
        expect.arrayContaining(['1'])
      );
      expect(result).toEqual(mockUpdatedMovie);
    });
    
    it('should return null when no movie is updated', async () => {
      // Arrange
      const completeMovieData = {
        title: 'Updated Movie Title',
        release_year: 2023,
        genre: 'Action',
        poster: '/test-poster-1.jpg',
        rating: 9.5,
        total_views: 10
      }; // This is a complete BaseMovie object
      mockDb.query.mockResolvedValueOnce([]);
      
      // Act
      const result = await MovieModel.update('2', completeMovieData);
      
      // Assert
      expect(result).toBeNull();
    });
  });
  
  describe('delete', () => {
    it('should delete a movie and return true on success', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([{ id: '1' }]);
      
      // Act
      const result = await MovieModel.delete('1');
      
      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/DELETE\s+FROM\s+movies.*WHERE\s+id\s*=\s*\$/i),
        ['1']
      );
      expect(result).toBe(true);
    });
    
    it('should return false when no movie is deleted', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([]);
      
      // Act
      const result = await MovieModel.delete('999');
      
      // Assert
      expect(result).toBe(false);
    });
  });
});
