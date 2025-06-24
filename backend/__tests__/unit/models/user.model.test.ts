// Required to fix TypeScript errors for Jest globals
// @ts-ignore - Jest globals are provided by the test environment
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;
declare const afterEach: any;

// First import the mock and set up the mocking
import mockDb from '../../mocks/database.mock';

// Mock the database module before importing the model that uses it
jest.mock('../../../src/config/database', () => mockDb);
jest.mock('../../../src/config/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  http: jest.fn(),
  debug: jest.fn(),
}));

// Mock auth config for hashing passwords
jest.mock('../../../src/config/auth', () => ({
  hashPassword: jest.fn().mockImplementation(() => Promise.resolve('hashed_password')),
  comparePassword: jest.fn(),
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  getTokenCookieOptions: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

// Need to import after mocking
const authConfig = require('../../../src/config/auth');

// Now import the model and any needed types
import UserModel from '../../../src/models/user.model';

describe('UserModel', () => {
  const mockUserId = 'user-123';
  const mockUser = {
    id: mockUserId,
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password',
    role: 'user',
    created_at: new Date(),
    updated_at: null,
  };

  const mockCreateUserData = {
    username: 'newuser',
    name: 'New User',
    email: 'new@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([mockUser]);

      // Act
      const result = await UserModel.findByEmail(mockUser.email);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM users WHERE email = \$1/),
        [mockUser.email],
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([]);

      // Act
      const result = await UserModel.findByEmail('nonexistent@example.com');

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM users WHERE email = \$1/),
        ['nonexistent@example.com'],
      );
      expect(result).toBeNull();
    });

    it('should propagate errors from database query', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockDb.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(UserModel.findByEmail(mockUser.email)).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return user when found by id', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([mockUser]);

      // Act
      const result = await UserModel.findById(mockUserId);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM users WHERE id = \$1/),
        [mockUserId],
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by id', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([]);

      // Act
      const result = await UserModel.findById('nonexistent-id');

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM users WHERE id = \$1/),
        ['nonexistent-id'],
      );
      expect(result).toBeNull();
    });

    it('should propagate errors from database query', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockDb.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(UserModel.findById(mockUserId)).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      // Arrange
      const createdUser = {
        ...mockUser,
        username: mockCreateUserData.username,
        name: mockCreateUserData.name,
        email: mockCreateUserData.email,
      };
      mockDb.query.mockResolvedValueOnce([createdUser]);

      // Ensure password hashing works correctly
      authConfig.hashPassword.mockResolvedValueOnce('hashed_password');

      // Act
      const result = await UserModel.create(mockCreateUserData);

      // Assert
      expect(authConfig.hashPassword).toHaveBeenCalledWith(mockCreateUserData.password);
      expect(mockDb.query).toHaveBeenCalledWith(expect.stringMatching(/INSERT INTO users/), [
        mockCreateUserData.username,
        mockCreateUserData.name,
        mockCreateUserData.email.toLowerCase(),
        'hashed_password',
        null,
        'user',
      ]);
      expect(result).toEqual(createdUser);
    });

    it('should use provided role if specified', async () => {
      // Arrange
      const adminUserData = {
        ...mockCreateUserData,
        role: 'admin',
      };
      const createdUser = {
        ...mockUser,
        username: adminUserData.username,
        name: adminUserData.name,
        email: adminUserData.email,
        role: 'admin',
      };
      mockDb.query.mockResolvedValueOnce([createdUser]);

      // Act
      const result = await UserModel.create(adminUserData);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO users/),
        expect.arrayContaining(['admin']),
      );
      expect(result.role).toBe('admin');
    });

    it('should propagate errors from database query', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockDb.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(UserModel.create(mockCreateUserData)).rejects.toThrow('Database error');
    });
  });

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([{ count: '1' }]);

      // Act
      const result = await UserModel.emailExists(mockUser.email);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT COUNT\(\*\) as count FROM users WHERE email = \$1/),
        [mockUser.email.toLowerCase()],
      );
      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([{ count: '0' }]);

      // Act
      const result = await UserModel.emailExists('nonexistent@example.com');

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT COUNT\(\*\) as count FROM users WHERE email = \$1/),
        ['nonexistent@example.com'],
      );
      expect(result).toBe(false);
    });

    it('should propagate errors from database query', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockDb.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(UserModel.emailExists(mockUser.email)).rejects.toThrow('Database error');
    });
  });

  describe('findByUsername', () => {
    it('should return user when found by username', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([mockUser]);

      // Act
      const result = await UserModel.findByUsername(mockUser.username);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM users WHERE username = \$1/),
        [mockUser.username],
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by username', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([]);

      // Act
      const result = await UserModel.findByUsername('nonexistentuser');

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM users WHERE username = \$1/),
        ['nonexistentuser'],
      );
      expect(result).toBeNull();
    });

    it('should propagate errors from database query', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockDb.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(UserModel.findByUsername(mockUser.username)).rejects.toThrow('Database error');
    });
  });

  describe('usernameExists', () => {
    it('should return true when username exists', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([{ count: '1' }]);

      // Act
      const result = await UserModel.usernameExists(mockUser.username);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT COUNT\(\*\) as count FROM users WHERE username = \$1/),
        [mockUser.username],
      );
      expect(result).toBe(true);
    });

    it('should return false when username does not exist', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([{ count: '0' }]);

      // Act
      const result = await UserModel.usernameExists('nonexistentuser');

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT COUNT\(\*\) as count FROM users WHERE username = \$1/),
        ['nonexistentuser'],
      );
      expect(result).toBe(false);
    });

    it('should propagate errors from database query', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockDb.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(UserModel.usernameExists(mockUser.username)).rejects.toThrow('Database error');
    });
  });

  describe('findByIdentifier', () => {
    it('should return user when found by email identifier', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([mockUser]);

      // Act
      const result = await UserModel.findByIdentifier(mockUser.email);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM users WHERE email = \$1 OR username = \$1/),
        [mockUser.email],
      );
      expect(result).toEqual(mockUser);
    });

    it('should return user when found by username identifier', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([mockUser]);

      // Act
      const result = await UserModel.findByIdentifier(mockUser.username);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM users WHERE email = \$1 OR username = \$1/),
        [mockUser.username],
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by identifier', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([]);

      // Act
      const result = await UserModel.findByIdentifier('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should propagate errors from database query', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockDb.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(UserModel.findByIdentifier(mockUser.email)).rejects.toThrow('Database error');
    });
  });

  describe('updateProfile', () => {
    it('should update and return user with new values', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };

      const updatedUser = {
        ...mockUser,
        name: updateData.name,
        bio: updateData.bio,
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce([updatedUser]);

      // Act
      const result = await UserModel.updateProfile(mockUserId, updateData);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE users\s+SET .* WHERE id = \$\d+ \s+RETURNING \*/s),
        expect.arrayContaining([updateData.name, updateData.bio, expect.any(Date), mockUserId]),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should handle avatar_url update', async () => {
      // Arrange
      const updateData = {
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const updatedUser = {
        ...mockUser,
        avatar_url: 'https://example.com/avatar.jpg',
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce([updatedUser]);

      // Act
      const result = await UserModel.updateProfile(mockUserId, updateData);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining([updatedUser.avatar_url]),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([]);
      const updateData = { name: 'Updated Name' };

      // Act & Assert
      await expect(UserModel.updateProfile(mockUserId, updateData)).rejects.toThrow(
        'User not found',
      );
    });

    it('should propagate errors from database query', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockDb.query.mockRejectedValueOnce(dbError);
      const updateData = { name: 'Updated Name' };

      // Act & Assert
      await expect(UserModel.updateProfile(mockUserId, updateData)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
