import request from 'supertest';
import app from '../src/app';
import db from '../src/config/database';

describe('Movie API Endpoints', () => {
  // Mock data for tests
  const testMovie = {
    title: 'Test Movie',
    director: 'Test Director',
    release_year: 2023,
    genre: 'Action',
    rating: 8.5
  };

  let createdMovieId: string;
  let authToken: string;

  // Before all tests, get authentication token
  beforeAll(async () => {
    // Register a test user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirm_password: 'Password123!'
      });
      
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      });
      
    authToken = loginResponse.body.data.accessToken;
  });

  // After all tests, clean up
  afterAll(async () => {
    try {
      // Clean up test data
      if (createdMovieId) {
        await db.query('DELETE FROM movies WHERE id = $1', [createdMovieId]);
      }
      await db.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
      
      // Close pool 
      await db.pool.end();
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  });

  // Test movie creation
  it('should create a new movie', async () => {
    const response = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testMovie);
      
    expect(response.status).toBe(201);
    expect(response.body.status).toBe(true);
    expect(response.body.data.movie).toHaveProperty('id');
    expect(response.body.data.movie.title).toBe(testMovie.title);
    
    // Store movie ID for future tests
    createdMovieId = response.body.data.movie.id;
  });

  // Test getting all movies
  it('should get all movies with pagination', async () => {
    const response = await request(app)
      .get('/api/movies')
      .query({ page: 1, limit: 10 });
      
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data).toHaveProperty('movies');
    expect(response.body.data).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data.movies)).toBe(true);
  });

  // Test getting a movie by ID
  it('should get a movie by ID', async () => {
    if (!createdMovieId) {
      throw new Error('Movie ID not available for test');
    }
    
    const response = await request(app)
      .get(`/api/movies/${createdMovieId}`);
      
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data.movie).toHaveProperty('id', createdMovieId);
    expect(response.body.data.movie.title).toBe(testMovie.title);
  });

  // Test updating a movie
  it('should update a movie', async () => {
    if (!createdMovieId) {
      throw new Error('Movie ID not available for test');
    }
    
    const updatedData = {
      title: 'Updated Movie Title',
      rating: 9.0
    };
    
    const response = await request(app)
      .put(`/api/movies/${createdMovieId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData);
      
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data.movie.title).toBe(updatedData.title);
    expect(response.body.data.movie.rating).toBe(updatedData.rating);
    // Check that other fields remain unchanged
    expect(response.body.data.movie.director).toBe(testMovie.director);
  });

  // Test deleting a movie
  it('should delete a movie', async () => {
    if (!createdMovieId) {
      throw new Error('Movie ID not available for test');
    }
    
    const response = await request(app)
      .delete(`/api/movies/${createdMovieId}`)
      .set('Authorization', `Bearer ${authToken}`);
      
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    
    // Verify movie was deleted
    const getResponse = await request(app)
      .get(`/api/movies/${createdMovieId}`);
      
    expect(getResponse.status).toBe(404);
  });
});
