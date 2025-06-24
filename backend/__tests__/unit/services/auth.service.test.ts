// @ts-nocheck - Disable TypeScript errors for the entire file
// @ts-ignore - Jest globals are provided by the test environment
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

// Import mocks
import UserModel from '../../../src/models/user.model';
import authConfig from '../../../src/config/auth';
import config from '../../../src/config/index';
import { AuthService } from '../../../src/services/auth.service';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '../../../src/utils/exceptions';

// Mock the modules
jest.mock('../../../src/models/user.model');
jest.mock('../../../src/config/auth');
jest.mock('../../../src/config/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
}));

xdescribe('AuthService', () => {
  let authService: AuthService;

  // Mock data
  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password',
    role: 'user',
    created_at: new Date(),
    updated_at: null,
    avatar_url: 'https://example.com/avatar.jpg',
  };

  const mockRegistrationData = {
    username: 'newuser',
    name: 'New User',
    email: 'new@example.com',
    password: 'password123',
  };

  const mockLoginCredentials = {
    identifier: 'testuser',
    password: 'password123',
  };

  const mockTokenPayload = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
  };

  // Mock response object
  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    // Default mock implementations
    (UserModel.emailExists as jest.Mock).mockResolvedValue(false);
    (UserModel.usernameExists as jest.Mock).mockResolvedValue(false);
    (UserModel.findByIdentifier as jest.Mock).mockResolvedValue(mockUser);
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
    (UserModel.create as jest.Mock).mockResolvedValue(mockUser);

    (authConfig.hashPassword as jest.Mock).mockResolvedValue('hashed_password');
    (authConfig.comparePassword as jest.Mock).mockResolvedValue(true);
    (authConfig.generateAccessToken as jest.Mock).mockReturnValue('access_token');
    (authConfig.generateRefreshToken as jest.Mock).mockReturnValue('refresh_token');
    (authConfig.verifyRefreshToken as jest.Mock).mockReturnValue(mockTokenPayload);
    (authConfig.getTokenCookieOptions as jest.Mock).mockReturnValue({ httpOnly: true });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const expectedResult = {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        name: mockUser.name,
      };

      // Act
      const result = await authService.register(mockRegistrationData);

      // Assert
      expect(UserModel.emailExists).toHaveBeenCalledWith(mockRegistrationData.email);
      expect(UserModel.usernameExists).toHaveBeenCalledWith(mockRegistrationData.username);
      expect(UserModel.create).toHaveBeenCalledWith({
        username: mockRegistrationData.username,
        name: mockRegistrationData.name,
        email: mockRegistrationData.email,
        password: mockRegistrationData.password,
        role: 'user',
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      (UserModel.emailExists as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(authService.register(mockRegistrationData)).rejects.toThrow(ConflictException);
      expect(UserModel.emailExists).toHaveBeenCalledWith(mockRegistrationData.email);
      expect(UserModel.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when username already exists', async () => {
      // Arrange
      (UserModel.usernameExists as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(authService.register(mockRegistrationData)).rejects.toThrow(ConflictException);
      expect(UserModel.emailExists).toHaveBeenCalledWith(mockRegistrationData.email);
      expect(UserModel.usernameExists).toHaveBeenCalledWith(mockRegistrationData.username);
      expect(UserModel.create).not.toHaveBeenCalled();
    });

    it('should propagate errors during registration', async () => {
      // Arrange
      const error = new Error('Database error');
      (UserModel.create as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(authService.register(mockRegistrationData)).rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    it('should login user successfully and return tokens', async () => {
      // Arrange
      const expectedResponse = {
        accessToken: 'access_token',
        expiresIn: config.jwtExpiresIn,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          avatarUrl: mockUser.avatar_url,
        },
      };

      // Act
      const result = await authService.login(mockLoginCredentials, mockResponse as any);

      // Assert
      expect(UserModel.findByIdentifier).toHaveBeenCalledWith(mockLoginCredentials.identifier);
      expect(authConfig.comparePassword).toHaveBeenCalledWith(
        mockLoginCredentials.password,
        mockUser.password,
      );
      expect(authConfig.generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
          username: mockUser.username,
        }),
      );
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      (UserModel.findByIdentifier as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(mockLoginCredentials, mockResponse as any)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authConfig.comparePassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      (authConfig.comparePassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(mockLoginCredentials, mockResponse as any)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authConfig.generateAccessToken).not.toHaveBeenCalled();
    });

    it('should propagate unexpected errors during login', async () => {
      // Arrange
      const error = new Error('Unexpected error');
      (UserModel.findByIdentifier as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(authService.login(mockLoginCredentials, mockResponse as any)).rejects.toThrow(
        'Unexpected error',
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      // Arrange
      const refreshToken = 'valid_refresh_token';
      const expectedResponse = {
        accessToken: 'access_token',
        expiresIn: config.jwtExpiresIn,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          avatarUrl: mockUser.avatar_url,
        },
      };

      // Act
      const result = await authService.refreshToken(refreshToken, mockResponse as any);

      // Assert
      expect(authConfig.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(UserModel.findById).toHaveBeenCalledWith(mockTokenPayload.id);
      expect(authConfig.generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
          username: mockUser.username,
        }),
      );
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw UnauthorizedException when user no longer exists', async () => {
      // Arrange
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken('valid_token', mockResponse as any)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authConfig.generateAccessToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on expired token', async () => {
      // Arrange
      const tokenError = new Error('Token expired');
      tokenError.name = 'TokenExpiredError';
      (authConfig.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw tokenError;
      });

      // Act & Assert
      await expect(authService.refreshToken('expired_token', mockResponse as any)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(UserModel.findById).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      // Arrange
      const tokenError = new Error('Invalid token');
      tokenError.name = 'JsonWebTokenError';
      (authConfig.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw tokenError;
      });

      // Act & Assert
      await expect(authService.refreshToken('invalid_token', mockResponse as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should propagate unexpected errors', async () => {
      // Arrange
      const error = new Error('Unexpected error');
      (authConfig.verifyRefreshToken as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(authService.refreshToken('token', mockResponse as any)).rejects.toThrow(
        'Unexpected error',
      );
    });
  });

  describe('logout', () => {
    it('should clear cookies on logout', async () => {
      // Act
      await authService.logout(mockResponse as any);

      // Assert
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token', expect.anything());
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token', expect.anything());
    });

    it('should propagate errors during logout', async () => {
      // Arrange
      const error = new Error('Cookie error');
      mockResponse.clearCookie.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(authService.logout(mockResponse as any)).rejects.toThrow('Cookie error');
    });
  });

  describe('getUserProfile', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.getUserProfile('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('should propagate errors when fetching user profile', async () => {
      // Arrange
      const error = new Error('Database error');
      (UserModel.findById as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(authService.getUserProfile(mockUser.id)).rejects.toThrow('Database error');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Name',
        avatarUrl: 'https://example.com/new-avatar.jpg',
      };

      const updatedUser = {
        ...mockUser,
        name: updateData.name,
        avatar_url: updateData.avatarUrl,
      };

      (UserModel.updateProfile as jest.Mock).mockResolvedValue(updatedUser);

      const expectedProfile = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar_url: updatedUser.avatar_url,
        role: updatedUser.role,
      };

      // Act
      const result = await authService.updateProfile(mockUser.id, updateData);

      // Assert
      expect(UserModel.findById).toHaveBeenCalledWith(mockUser.id);
      expect(UserModel.updateProfile).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(result).toEqual(expectedProfile);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      (UserModel.findById as jest.Mock).mockResolvedValue(null);
      const updateData = { name: 'Updated Name' };

      // Act & Assert
      await expect(authService.updateProfile('nonexistent-id', updateData)).rejects.toThrow(
        NotFoundException,
      );
      expect(UserModel.updateProfile).not.toHaveBeenCalled();
    });

    it('should propagate errors during profile update', async () => {
      // Arrange
      const error = new Error('Database error');
      (UserModel.updateProfile as jest.Mock).mockRejectedValue(error);
      const updateData = { name: 'Updated Name' };

      // Act & Assert
      await expect(authService.updateProfile(mockUser.id, updateData)).rejects.toThrow(
        'Database error',
      );
    });
  });

  // Add tests for resetPassword method if available in your implementation
});
