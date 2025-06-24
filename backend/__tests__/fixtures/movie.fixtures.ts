/**
 * Test fixtures for movies
 * Contains sample data to be used across tests
 */

import { Movie, BaseMovie } from '../../src/types/movie';

// Define DTO types to match the BaseMovie structure
export type CreateMovieDto = BaseMovie;
export type UpdateMovieDto = Partial<BaseMovie>;

// Sample movie objects for testing
export const movieFixtures: Movie[] = [
  {
    id: '1',
    title: 'Test Movie 1',
    release_year: 2023,
    genre: 'Action',
    poster: '/test-poster-1.jpg',
    rating: 8.5,
    total_views: 100,
    created_at: new Date('2023-01-01T00:00:00Z'),
    updated_at: new Date('2023-01-01T00:00:00Z')
  },
  {
    id: '2',
    title: 'Test Movie 2',
    release_year: 2023,
    genre: 'Drama',
    poster: '/test-poster-2.jpg',
    rating: 7.5,
    total_views: 50,
    created_at: new Date('2023-02-02T00:00:00Z'),
    updated_at: new Date('2023-02-02T00:00:00Z')
  }
];

// Sample create movie DTO
export const createMovieDtoFixture: CreateMovieDto = {
  title: 'New Test Movie',
  release_year: 2023,
  genre: 'Comedy',
  poster: '/new-test-poster.jpg',
  rating: 9.0,
  total_views: 0
};

// Sample update movie DTO
export const updateMovieDtoFixture: UpdateMovieDto = {
  title: 'Updated Movie Title',
  rating: 9.5,
  total_views: 10
};

// SQL seed data for test database
export const movieSeedSql = `
INSERT INTO movies (id, title, release_year, genre, poster, rating, total_views, created_at, updated_at)
VALUES 
  ('1', 'Test Movie 1', 2023, 'Action', '/test-poster-1.jpg', 8.5, 100, NOW(), NOW()),
  ('2', 'Test Movie 2', 2023, 'Drama', '/test-poster-2.jpg', 7.5, 50, NOW(), NOW());
`;

export default {
  movies: movieFixtures,
  createMovieDto: createMovieDtoFixture,
  updateMovieDto: updateMovieDtoFixture,
  seedSql: movieSeedSql
};
