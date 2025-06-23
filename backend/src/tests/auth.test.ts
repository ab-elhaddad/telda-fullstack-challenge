import request from 'supertest';
import app from '../app';
import { pool } from '../db';
import {  } from 'jest-ts';

describe('Authentication Flow Tests', () => {
  const testUser = {
    username: 'testuser123',
    email: 'test@example.com',
    password: 'TestPassword123',
    name: 'Test User'
  };
  
  // Clean up test data before and after tests
  beforeAll(async () => {
    // Delete test user if it exists
    await pool.query(
      'DELETE FROM users WHERE email = $1 OR username = $2',
      [testUser.email, testUser.username]
    );
  });
  
  afterAll(async () => {
    // Clean up test data
    await pool.query(
      'DELETE FROM users WHERE email = $1 OR username = $2',
      [testUser.email, testUser.username]
    );
    
    // Close database connection
    await pool.end();
  });

  // Test user registration
  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('username', testUser.username);
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.user).toHaveProperty('name', testUser.name);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should not register a user with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          username: 'differentusername'
        });
      
      expect(response.status).toBe(409); // Conflict
    });

    it('should not register a user with existing username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'different@example.com'
        });
      
      expect(response.status).toBe(409); // Conflict
    });
  });

  // Test login flow
  describe('User Login', () => {
    it('should login with email successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: testUser.email,
          password: testUser.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refresh_token=');
    });

    it('should login with username successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: testUser.username,
          password: testUser.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: testUser.email,
          password: 'wrong_password'
        });
      
      expect(response.status).toBe(401);
    });
  });

  // Test token refresh and authentication
  describe('Token Refresh and Authentication', () => {
    let accessToken: string;
    let cookies: string[];
    
    beforeAll(async () => {
      // Login to get access token and refresh token cookie
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: testUser.email,
          password: testUser.password
        });
      
      accessToken = loginResponse.body.data.accessToken;
      cookies = loginResponse.headers['set-cookie'];
    });
    
    it('should get user profile with valid access token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('username', testUser.username);
    });

    it('should refresh tokens with valid refresh token cookie', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookies);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.headers['set-cookie']).toBeDefined(); // New refresh token
    });

    it('should logout successfully and clear refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookies);
        
      expect(response.status).toBe(200);
      expect(response.headers['set-cookie'][0]).toContain('refresh_token=;'); // Empty cookie
    });
  });

  // Test profile update functionality
  describe('Profile Updates', () => {
    let accessToken: string;
    
    beforeAll(async () => {
      // Login to get access token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: testUser.email,
          password: testUser.password
        });
      
      accessToken = loginResponse.body.data.accessToken;
    });
    
    it('should update user profile information', async () => {
      const updatedProfile = {
        name: 'Updated Name',
        bio: 'This is my new bio'
      };
      
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedProfile);
      
      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty('name', updatedProfile.name);
      expect(response.body.data.user).toHaveProperty('bio', updatedProfile.bio);
    });
    
    it('should update password when providing correct old password', async () => {
      const passwordUpdate = {
        oldPassword: testUser.password,
        newPassword: 'NewPassword123!',
        confirm_password: 'NewPassword123!'
      };
      
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(passwordUpdate);
      
      expect(response.status).toBe(200);
      
      // Verify old password no longer works
      const oldLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: testUser.email,
          password: testUser.password
        });
      
      expect(oldLoginResponse.status).toBe(401);
      
      // Verify new password works
      const newLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: testUser.email,
          password: 'NewPassword123!'
        });
      
      expect(newLoginResponse.status).toBe(200);
      
      // Update test user password back for future tests
      testUser.password = 'NewPassword123!';
    });
    
    it('should not update password with incorrect old password', async () => {
      const passwordUpdate = {
        oldPassword: 'WrongOldPassword',
        newPassword: 'AnotherNewPassword123',
        confirm_password: 'AnotherNewPassword123'
      };
      
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(passwordUpdate);
      
      expect(response.status).toBe(401);
    });
  });
});
