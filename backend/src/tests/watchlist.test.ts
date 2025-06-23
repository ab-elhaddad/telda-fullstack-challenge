import request from 'supertest';
import app from '../app';
import db from '../config/database';

describe('Watchlist API Tests', () => {
  // Test user credentials
  const testUser = {
    username: 'watchlisttest',
    email: 'watchlist@example.com',
    password: 'WatchlistTest123',
    name: 'Watchlist User'
  };

  // Test movie data
  const testMovies = [
    {
      title: 'Watchlist Test Movie 1',
      director: 'Test Director 1',
      release_year: 2022,
      genre: 'Action',
      rating: 8.0
    },
    {
      title: 'Watchlist Test Movie 2',
      director: 'Test Director 2',
      release_year: 2021,
      genre: 'Drama',
      rating: 9.0
    },
    {
      title: 'Watchlist Test Movie 3',
      director: 'Test Director 3',
      release_year: 2023,
      genre: 'Comedy',
      rating: 7.5
    }
  ];

  let userToken: string;
  let adminToken: string;
  let userId: string;
  let movieIds: string[] = [];

  // Set up test environment
  beforeAll(async () => {
    // Clean up existing test users and movies
    await db.pool.query(
      'DELETE FROM users WHERE email = $1',
      [testUser.email]
    );
    
    await db.pool.query(
      'DELETE FROM movies WHERE title LIKE $1',
      ['Watchlist Test Movie%']
    );

    // Create admin user for creating test movies
    const testAdmin = {
      username: 'watchlistadmin',
      email: 'watchlistadmin@example.com',
      password: 'AdminPassword123',
      name: 'Watchlist Admin',
      role: 'admin'
    };

    await db.pool.query(
      'DELETE FROM users WHERE email = $1',
      [testAdmin.email]
    );

    // Register test user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    userToken = userResponse.body.data.accessToken;
    userId = userResponse.body.data.user.id;

    // Create admin user directly in database
    const hashedPassword = await db.pool.query(
      'SELECT crypt($1, gen_salt($2))',
      [testAdmin.password, 'bf']
    );
    
    await db.pool.query(
      'INSERT INTO users (username, email, password, name, role) VALUES ($1, $2, $3, $4, $5)',
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

    // Create test movies
    for (const movie of testMovies) {
      const response = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(movie);
      
      movieIds.push(response.body.data.id);
    }
  });

  afterAll(async () => {
    // Clean up test data
    await db.pool.query(
      'DELETE FROM watchlist WHERE user_id = $1',
      [userId]
    );

    await db.pool.query(
      'DELETE FROM movies WHERE title LIKE $1',
      ['Watchlist Test Movie%']
    );

    await db.pool.query(
      'DELETE FROM users WHERE email = $1 OR email = $2',
      [testUser.email, 'watchlistadmin@example.com']
    );
    
    // Close database connection
    await db.pool.end();
  });

  describe('Watchlist CRUD Operations', () => {
    it('should add movie to watchlist', async () => {
      const response = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ movie_id: movieIds[0] });
      
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('movie_id', movieIds[0]);
      expect(response.body.data).toHaveProperty('user_id', userId);
      expect(response.body.data).toHaveProperty('status', 'to_watch'); // Default status
    });

    it('should not add duplicate movie to watchlist', async () => {
      const response = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ movie_id: movieIds[0] });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already in watchlist');
    });

    it('should check if movie is in watchlist', async () => {
      const response = await request(app)
        .get(`/api/watchlist/check/${movieIds[0]}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('inWatchlist', true);
      expect(response.body.data).toHaveProperty('status', 'to_watch');
      
      // Check movie not in watchlist
      const notInWatchlistResponse = await request(app)
        .get(`/api/watchlist/check/${movieIds[2]}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(notInWatchlistResponse.status).toBe(200);
      expect(notInWatchlistResponse.body.data).toHaveProperty('inWatchlist', false);
    });

    it('should update watchlist item status', async () => {
      const response = await request(app)
        .patch(`/api/watchlist/${movieIds[0]}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'watched' });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('movie_id', movieIds[0]);
      expect(response.body.data).toHaveProperty('status', 'watched');
    });

    it('should reject invalid watchlist status updates', async () => {
      const response = await request(app)
        .patch(`/api/watchlist/${movieIds[0]}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'invalid_status' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('must be either');
    });

    it('should add another movie to watchlist for filtering tests', async () => {
      const response = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ movie_id: movieIds[1] });
      
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('movie_id', movieIds[1]);
      expect(response.body.data).toHaveProperty('status', 'to_watch');
    });
  });

  describe('Watchlist Filtering and Retrieval', () => {
    it('should retrieve user watchlist with associated movie data', async () => {
      const response = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('watchlist');
      expect(response.body.data.watchlist.length).toBe(2);
      expect(response.body.data).toHaveProperty('pagination');
      
      // Check if movies have full details
      const watchlistItem = response.body.data.watchlist[0];
      expect(watchlistItem).toHaveProperty('title');
      expect(watchlistItem).toHaveProperty('director');
      expect(watchlistItem).toHaveProperty('genre');
    });

    it('should filter watchlist by status', async () => {
      // Filter for 'watched' items
      const watchedResponse = await request(app)
        .get('/api/watchlist')
        .query({ status: 'watched' })
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(watchedResponse.status).toBe(200);
      expect(watchedResponse.body.data.watchlist.length).toBe(1);
      expect(watchedResponse.body.data.watchlist[0]).toHaveProperty('status', 'watched');
      expect(watchedResponse.body.data.watchlist[0]).toHaveProperty('movie_id', movieIds[0]);
      
      // Filter for 'to_watch' items
      const toWatchResponse = await request(app)
        .get('/api/watchlist')
        .query({ status: 'to_watch' })
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(toWatchResponse.status).toBe(200);
      expect(toWatchResponse.body.data.watchlist.length).toBe(1);
      expect(toWatchResponse.body.data.watchlist[0]).toHaveProperty('status', 'to_watch');
      expect(toWatchResponse.body.data.watchlist[0]).toHaveProperty('movie_id', movieIds[1]);
    });

    it('should sort watchlist by specified fields', async () => {
      // Sort by title ascending
      const response = await request(app)
        .get('/api/watchlist')
        .query({ sort_by: 'title', order: 'ASC' })
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      
      // Check if titles are in ascending order
      const items = response.body.data.watchlist;
      expect(items.length).toBe(2);
      
      if (items[0].title && items[1].title) {
        expect(items[0].title.localeCompare(items[1].title)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('Watchlist Removal', () => {
    it('should remove movie from watchlist', async () => {
      const response = await request(app)
        .delete(`/api/watchlist/${movieIds[0]}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('removed from watchlist');
      
      // Check that the movie is no longer in watchlist
      const checkResponse = await request(app)
        .get(`/api/watchlist/check/${movieIds[0]}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(checkResponse.status).toBe(200);
      expect(checkResponse.body.data).toHaveProperty('inWatchlist', false);
    });

    it('should handle removing non-existent watchlist items gracefully', async () => {
      const response = await request(app)
        .delete(`/api/watchlist/${movieIds[2]}`) // Not added to watchlist
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found in watchlist');
    });
  });
});
