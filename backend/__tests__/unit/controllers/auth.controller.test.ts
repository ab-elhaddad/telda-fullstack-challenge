// @ts-nocheck - Disable TypeScript errors for the entire file
// @ts-ignore - Jest globals are provided by the test environment
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../../src/controllers/auth.controller';
import authService from '../../../src/services/auth.service';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '../../../src/utils/exceptions';
import { UserRequest } from '../../../src/types/express';

// Mock the auth service
jest.mock('../../../src/services/auth.service', () => ({
  register: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
  getUserProfile: jest.fn(),
  updateProfile: jest.fn(),
  resetPassword: jest.fn(),
}));

jest.mock('../../../src/config/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
}));

describe('AuthController', () => {
  let authController: AuthController;

  // Mock data
  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
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

  const mockAuthTokens = {
    accessToken: 'access_token',
    expiresIn: 3600,
    user: mockUser,
  };

  // Mock request, response, and next objects
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockUserRequest: Partial<UserRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
    authController = new AuthController();

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Add success/created/error response functions to response object
    mockResponse.status = jest.fn().mockReturnThis();
    mockResponse.json = jest.fn().mockReturnThis();

    mockNext = jest.fn();

    mockUserRequest = {
      body: {},
      user: {
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: 'role',
      },
    };
  });

  describe('register', () => {
    it('should register a user and return created response with user data', async () => {
      // Arrange
      mockRequest.body = mockRegistrationData;
      (authService.register as jest.Mock).mockResolvedValueOnce(mockUser);
      mockResponse.status = jest.fn().mockReturnThis();
      mockResponse.json = jest.fn().mockImplementation(function (this: Response, body: any) {
        expect(body).toEqual({
          status: true,
          message: 'User registered successfully',
          data: { user: mockUser },
        });
        return this;
      });

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(mockRegistrationData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle ConflictException when email already exists', async () => {
      // Arrange
      mockRequest.body = mockRegistrationData;
      const error = new ConflictException('User with this email');
      (authService.register as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(mockRegistrationData);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle other errors during registration', async () => {
      // Arrange
      mockRequest.body = mockRegistrationData;
      const error = new Error('Unexpected error');
      (authService.register as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(mockRegistrationData);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should login user and return tokens with success response', async () => {
      // Arrange
      mockRequest.body = mockLoginCredentials;
      (authService.login as jest.Mock).mockResolvedValueOnce(mockAuthTokens);
      mockResponse.json = jest.fn().mockImplementation(function (this: Response, body: any) {
        expect(body).toEqual({
          status: true,
          message: 'Login successful',
          data: mockAuthTokens,
        });
        return this;
      });

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockLoginCredentials, mockResponse);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle UnauthorizedException during login', async () => {
      // Arrange
      mockRequest.body = mockLoginCredentials;
      const error = new UnauthorizedException('Invalid credentials');
      (authService.login as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockLoginCredentials, mockResponse);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle other errors during login', async () => {
      // Arrange
      mockRequest.body = mockLoginCredentials;
      const error = new Error('Unexpected error');
      (authService.login as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockLoginCredentials, mockResponse);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getProfile', () => {
    it('should fetch user profile and return success response', async () => {
      // Arrange
      (authService.getUserProfile as jest.Mock).mockResolvedValueOnce(mockUser);
      mockResponse.json = jest.fn().mockImplementation(function (this: Response, body: any) {
        expect(body).toEqual({
          status: true,
          message: 'Profile fetched successfully',
          data: { user: mockUser },
        });
        return this;
      });

      // Act
      await authController.getProfile(
        mockUserRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(authService.getUserProfile).toHaveBeenCalledWith(mockUser.id);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle case when user is not authenticated', async () => {
      // Arrange
      mockUserRequest.user = undefined;

      // Act
      await authController.getProfile(
        mockUserRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(authService.getUserProfile).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle NotFoundException when profile not found', async () => {
      // Arrange
      const error = new NotFoundException('User');
      (authService.getUserProfile as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await authController.getProfile(
        mockUserRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(authService.getUserProfile).toHaveBeenCalledWith(mockUser.id);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle other errors when fetching profile', async () => {
      // Arrange
      const error = new Error('Unexpected error');
      (authService.getUserProfile as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await authController.getProfile(
        mockUserRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(authService.getUserProfile).toHaveBeenCalledWith(mockUser.id);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return success response', async () => {
      // Arrange
      const updateData = { name: 'Updated Name', avatarUrl: 'new-avatar.jpg' };
      mockUserRequest.body = updateData;
      (authService.updateProfile as jest.Mock).mockResolvedValueOnce(mockUser);
      mockResponse.json = jest.fn().mockImplementation(function (this: Response, body: any) {
        expect(body).toEqual({
          status: true,
          message: 'Profile updated successfully',
          data: { user: mockUser },
        });
        return this;
      });

      // Act
      await authController.updateProfile(
        mockUserRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(authService.updateProfile).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle case when user is not authenticated', async () => {
      // Arrange
      mockUserRequest.user = undefined;
      const updateData = { name: 'Updated Name' };
      mockUserRequest.body = updateData;

      // Act
      await authController.updateProfile(
        mockUserRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(authService.updateProfile).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle NotFoundException when user not found', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      mockUserRequest.body = updateData;
      const error = new NotFoundException('User');
      (authService.updateProfile as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await authController.updateProfile(
        mockUserRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(authService.updateProfile).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle other errors during profile update', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      mockUserRequest.body = updateData;
      const error = new Error('Unexpected error');
      (authService.updateProfile as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await authController.updateProfile(
        mockUserRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(authService.updateProfile).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('resetPassword', () => {
    it('should handle case when user is not authenticated', async () => {
      // Arrange
      mockUserRequest.user = undefined;
      const passwordData = { oldPassword: 'oldpass', newPassword: 'newpass' };
      mockUserRequest.body = passwordData;

      // Act
      await authController.resetPassword(
        mockUserRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(authService.resetPassword).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle UnauthorizedException for invalid old password', async () => {
      // Arrange
      const passwordData = { oldPassword: 'wrongpass', newPassword: 'newpass' };
      mockUserRequest.body = passwordData;
      const error = new UnauthorizedException('Invalid old password');
      (authService.resetPassword as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await authController.resetPassword(
        mockUserRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(authService.resetPassword).toHaveBeenCalledWith(
        mockUser.id,
        passwordData.oldPassword,
        passwordData.newPassword,
      );
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle other errors during password reset', async () => {
      // Arrange
      const passwordData = { oldPassword: 'oldpass', newPassword: 'newpass' };
      mockUserRequest.body = passwordData;
      const error = new Error('Unexpected error');
      (authService.resetPassword as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await authController.resetPassword(
        mockUserRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(authService.resetPassword).toHaveBeenCalledWith(
        mockUser.id,
        passwordData.oldPassword,
        passwordData.newPassword,
      );
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
