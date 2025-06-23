import request from 'supertest';
import app from '../app';
import db from '../config/database';

describe('Upload API Endpoints', () => {
  let authToken: string;

  // Create a test user and get authentication token before tests
  beforeAll(async () => {
    // Create test user
    const testUser = {
      username: 'uploaduser',
      email: 'upload@example.com',
      password: 'TestPassword123',
      name: 'Upload Test User'
    };

    // Clean up existing test user if any
    await db.query(
      'DELETE FROM users WHERE email = $1 OR username = $2',
      [testUser.email, testUser.username]
    );

    // Register test user
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: testUser.email,
        password: testUser.password
      });

    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up test user
    await db.query(
      'DELETE FROM users WHERE email = $1',
      ['upload@example.com']
    );

    await db.pool.end();
  });

  describe('File Upload Endpoint', () => {
    it('should require authentication for file upload', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('test image content'), 'test-image.jpg');

      expect(response.status).toBe(401);
    });

    it('should upload a file successfully with authentication', async () => {
      // Create a small test image buffer (not a real image but works for tests)
      const fakeImageBuffer = Buffer.from(
        'GIF87a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;',
        'binary'
      );

      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', fakeImageBuffer, 'test-image.gif');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('url');
      expect(response.body.data).toHaveProperty('filename');
      expect(response.body.data).toHaveProperty('mimetype');
      expect(response.body.data).toHaveProperty('size');
    });

    it('should reject file upload with invalid file type', async () => {
      // Create a text file buffer
      const textFileBuffer = Buffer.from('This is not an image', 'utf-8');

      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', textFileBuffer, 'test.txt');

      expect(response.status).toBe(400);
    });
  });
});
