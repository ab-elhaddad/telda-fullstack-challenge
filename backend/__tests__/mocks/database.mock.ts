/**
 * Mock implementation of the database module
 * This allows unit tests to avoid actual database connections
 */
// @ts-ignore - Jest globals are provided by the test environment
declare const jest: any;

// Mock query results with proper typing
export const mockQueryResult = <T>(data: T[]): Promise<T[]> => {
  return Promise.resolve(data);
};

// Mock database client with transaction support
export const mockDbClient = {
  // Use underscore prefix to indicate unused parameters
  query: jest.fn().mockImplementation(<T>(_text: string, _params?: any[]): Promise<T[]> => {
    return Promise.resolve([]);
  }),
  release: jest.fn(),
};

// Mock transaction implementation
export const mockTransaction = jest.fn().mockImplementation(
  async (callback: (client: any) => Promise<void>) => {
    await callback(mockDbClient);
    return Promise.resolve();
  }
);

// Main mock database object that matches the actual database interface
const mockDb = {
  // Use underscore prefix to indicate unused parameters
  query: jest.fn().mockImplementation(<T>(_text: string, _params?: any[]): Promise<T[]> => {
    return Promise.resolve([]);
  }),
  transaction: mockTransaction,
  end: jest.fn().mockResolvedValue(undefined),
};

export default mockDb;
