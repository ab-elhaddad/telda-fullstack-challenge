import jwt from 'jsonwebtoken';
import config from '../../src/config';

/**
 * Generate a test JWT token for authentication in tests
 * 
 * @param userId User ID to include in token
 * @param role User role (default: 'user')
 * @returns JWT token string
 */
export const generateTestToken = (userId: string, role: 'user' | 'admin' = 'user'): string => {
  const payload = {
    userId,
    role
  };
  
  return jwt.sign(payload, config.jwtSecret || 'test-secret', {
    expiresIn: '1h'
  });
};

/**
 * Get authorization headers with token for test requests
 * 
 * @param userId User ID
 * @param role User role
 * @returns Object with Authorization header
 */
export const getAuthHeaders = (userId: string, role: 'user' | 'admin' = 'user'): { Authorization: string } => {
  const token = generateTestToken(userId, role);
  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Helper to simulate authenticated request
 * 
 * @param request Supertest request object
 * @param userId User ID
 * @param role User role
 * @returns Supertest request with auth headers
 */
export const authenticatedRequest = (request: any, userId: string, role: 'user' | 'admin' = 'user'): any => {
  const headers = getAuthHeaders(userId, role);
  return request.set('Authorization', headers.Authorization);
};
