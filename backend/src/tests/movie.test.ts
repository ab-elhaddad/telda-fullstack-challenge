import request from 'supertest';
import app from '../app';
import db from '../config/database';

describe('Movie API Tests', () => {
  // Test movie data
  const testMovie = {
    title: 'Test Movie',
    director: 'Test Director',
    release_year: 2022,
    genre: 'Test Genre',
    poster: 'https://example.com/poster.jpg',
    rating: 8.5
  };

  let movieId: string;
  let userToken: string;
  let adminToken: string;

  // Set up test environment
  beforeAll(async () => {
    // Create test user for authentication
    const testUser = {
      username: 'movietest',
      email: 'movietest@example.com',
      password: 'TestPassword123',
      name: 'Movie Tester'
    };

    const testAdmin = {
      username: 'movietestadmin',
      email: 'movieadmin@example.com',
      password: 'AdminPassword123',
      name: 'Movie Admin',
      role: 'admin'
    };

    // Clean up existing test users and movies
    await db.pool.query(
      'DELETE FROM users WHERE email = $1 OR email = $2',
      [testUser.email, testAdmin.email]
    );
    
    await db.pool.query(
      'DELETE FROM movies WHERE title = $1 AND director = $2',
      [testMovie.title, testMovie.director]
    );

    // Register test user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    userToken = userResponse.body.data.accessToken;

    // Create admin user directly in the database
    const hashedPassword = await db.pool.query(
      'SELECT crypt($1, gen_salt($2))',
      [testAdmin.password, 'bf']
    );
    
    await db.pool.query(
      'INSERT INTO users (username, email, password, name, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [testAdmin.username, testAdmin.email, hashedPassword.rows[0].crypt, testAdmin.name, testAdmin.role]
    );

    // Login as admin
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: testAdmin.email,
        password: testAdmin.password
      });
    
    adminToken = adminResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    await db.pool.query(
      'DELETE FROM movies WHERE title = $1 AND director = $2',
      [testMovie.title, testMovie.director]
    );

    await db.pool.query(
      'DELETE FROM users WHERE email = $1 OR email = $2',
      ['movietest@example.com', 'movieadmin@example.com']
    );
    
    // Close database connection
    await db.pool.end();
  });

  describe('Movie CRUD Operations', () => {
    it('should create a new movie successfully as admin', async () => {
      const response = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testMovie);
      
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title', testMovie.title);
      expect(response.body.data).toHaveProperty('director', testMovie.director);
      expect(response.body.data).toHaveProperty('release_year', testMovie.release_year);
      
      // Save movie ID for future tests
      movieId = response.body.data.id;
    });

    it('should not allow non-admin users to create movies', async () => {
      const response = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Unauthorized Movie',
          director: 'Unauthorized Director',
          release_year: 2023
        });
      
      expect(response.status).toBe(403);
    });

    it('should retrieve a movie by ID', async () => {
      const response = await request(app)
        .get(`/api/movies/${movieId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id', movieId);
      expect(response.body.data).toHaveProperty('title', testMovie.title);
    });

    it('should update a movie as admin', async () => {
      const updatedData = {
        title: 'Updated Test Movie',
        rating: 9.0
      };

      const response = await request(app)
        .put(`/api/movies/${movieId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('title', updatedData.title);
      expect(response.body.data).toHaveProperty('rating', updatedData.rating);
      expect(response.body.data).toHaveProperty('director', testMovie.director); // Unchanged field
    });

    it('should not allow non-admin users to update movies', async () => {
      const response = await request(app)
        .put(`/api/movies/${movieId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Unauthorized Update' });
      
      expect(response.status).toBe(403);
    });
  });

  describe('Movie Search, Filtering and Pagination', () => {
    // Add some additional test movies for search and filtering
    beforeAll(async () => {
      const testMovies = [
        {
          title: 'Action Movie 1',
          director: 'Action Director',
          release_year: 2020,
          genre: 'action',
          rating: 7.5
        },
        {
          title: 'Action Movie 2',
          director: 'Action Director',
          release_year: 2021,
          genre: 'action',
          rating: 8.0
        },
        {
          title: 'Drama Movie',
          director: 'Drama Director',
          release_year: 2019,
          genre: 'drama',
          rating: 9.0
        }
      ];

      for (const movie of testMovies) {
        await request(app)
          .post('/api/movies')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(movie);
      }
    });

    it('should search movies by general search term', async () => {
      const response = await request(app)
        .get('/api/movies')
        .query({ search: 'Action' });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('movies');
      expect(response.body.data.movies.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.movies.some((m: any) => m.title === 'Action Movie 1')).toBe(true);
      expect(response.body.data.movies.some((m: any) => m.title === 'Action Movie 2')).toBe(true);
    });

    it('should filter movies by genre', async () => {
      const response = await request(app)
        .get('/api/movies')
        .query({ genre: 'drama' });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('movies');
      expect(response.body.data.movies.some((m: any) => m.title === 'Drama Movie')).toBe(true);
      expect(response.body.data.movies.every((m: any) => m.title !== 'Action Movie 1')).toBe(true);
    });

    it('should filter movies by year range', async () => {
      const response = await request(app)
        .get('/api/movies')
        .query({ 
          year_from: 2020,
          year_to: 2021
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('movies');
      expect(response.body.data.movies.some((m: any) => m.title === 'Action Movie 1')).toBe(true);
      expect(response.body.data.movies.some((m: any) => m.title === 'Action Movie 2')).toBe(true);
      expect(response.body.data.movies.every((m: any) => m.title !== 'Drama Movie')).toBe(true);
    });

    it('should filter movies by min rating', async () => {
      const response = await request(app)
        .get('/api/movies')
        .query({ min_rating: 8.5 });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('movies');
      expect(response.body.data.movies.every((m: any) => m.rating >= 8.5)).toBe(true);
    });

    it('should sort movies by specified field', async () => {
      const response = await request(app)
        .get('/api/movies')
        .query({ 
          sort_by: 'rating',
          order: 'ASC'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('movies');
      
      // Check if movies are sorted by rating in ascending order
      const movies = response.body.data.movies;
      for (let i = 1; i < movies.length; i++) {
        if (movies[i-1].rating && movies[i].rating) {
          expect(parseFloat(movies[i-1].rating) <= parseFloat(movies[i].rating)).toBe(true);
        }
      }
    });
    
    it('should implement pagination correctly', async () => {
      // First page with 2 items
      const page1Response = await request(app)
        .get('/api/movies')
        .query({ 
          page: 1,
          limit: 2
        });
      
      expect(page1Response.status).toBe(200);
      expect(page1Response.body.data).toHaveProperty('movies');
      expect(page1Response.body.data.movies.length).toBe(2);
      
      // Second page with 2 items
      const page2Response = await request(app)
        .get('/api/movies')
        .query({ 
          page: 2,
          limit: 2
        });
      
      expect(page2Response.status).toBe(200);
      expect(page2Response.body.data).toHaveProperty('movies');
      
      // Ensure page 1 and page 2 movies are different
      const page1Ids = page1Response.body.data.movies.map((m: any) => m.id);
      const page2Ids = page2Response.body.data.movies.map((m: any) => m.id);
      
      for (const id of page2Ids) {
        expect(page1Ids.includes(id)).toBe(false);
      }
    });

    it('should handle the simplified search endpoint', async () => {
      const response = await request(app)
        .get('/api/movies/search')
        .query({ 
          search: 'drama',
          genre: 'drama'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('movies');
      expect(response.body.data.movies.some((m: any) => m.title === 'Drama Movie')).toBe(true);
    });
  });

  describe('Movie Deletion', () => {
    it('should delete a movie as admin', async () => {
      const response = await request(app)
        .delete(`/api/movies/${movieId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Movie deleted successfully');
      
      // Try to retrieve the deleted movie
      const getResponse = await request(app)
        .get(`/api/movies/${movieId}`);
      
      expect(getResponse.status).toBe(404);
    });
  });
});
