// Jest setup file
import dotenv from 'dotenv';

// Load environment variables from .env.test file if it exists, otherwise from .env
dotenv.config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(30000);

// Mock implementation for logger to avoid console output during tests
jest.mock('@config/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  http: jest.fn(),
  debug: jest.fn(),
}));

// Clean up resources after all tests
afterAll(async () => {
  // Add any cleanup code here
  // For example, close database connections, etc.
});
