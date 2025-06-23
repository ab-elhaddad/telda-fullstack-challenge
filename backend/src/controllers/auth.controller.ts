import { Request, Response, NextFunction } from 'express';
import authService from '@services/auth.service';
import { successResponse, createdResponse } from '@utils/response';
import { LoginCredentials, RegistrationData } from '../types/auth';
import { UserRequest } from '../types/express';
import logger from '@config/logger';

/**
 * Authentication controller - handles user registration, login, and token management
 */
export class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: RegistrationData = req.body;
      const user = await authService.register(userData);
      createdResponse(res, { user }, 'User registered successfully');
    } catch (error) {
      logger.error('Error in AuthController.register:', error);
      next(error);
    }
  }

  /**
   * Login a user
   * @route POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;
      const tokens = await authService.login(credentials, res);
      successResponse(res, tokens, 'Login successful');
    } catch (error) {
      logger.error('Error in AuthController.login:', error);
      next(error);
    }
  }

  /**
   * Get current user profile
   * @route GET /api/auth/me
   */
  async getProfile(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new Error('User not authenticated');
      }

      const user = await authService.getUserProfile(req.user.id);
      successResponse(res, { user }, 'Profile fetched successfully');
    } catch (error) {
      logger.error(`Error in AuthController.getProfile:`, error);
      next(error);
    }
  }

  /**
   * Update user profile
   * @route PATCH /api/auth/profile
   */
  async updateProfile(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new Error('User not authenticated');
      }

      const profileData = req.body;
      const updatedProfile = await authService.updateProfile(req.user.id, profileData);
      successResponse(res, { user: updatedProfile }, 'Profile updated successfully');
    } catch (error) {
      logger.error('Error in AuthController.updateProfile:', error);
      next(error);
    }
  }

  /**
   * Reset password
   * @route PATCH /api/auth/password
   */
  async resetPassword(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new Error('User not authenticated');
      }

      const { oldPassword, newPassword } = req.body;
      await authService.resetPassword(req.user.id, oldPassword, newPassword);

      // Clear authentication cookies after password reset
      res.clearCookie('access_token', { path: '/api/auth' });
      res.clearCookie('refresh_token', { path: '/api/auth' });

      successResponse(
        res,
        null,
        'Password reset successfully. Please login again with your new password.',
      );
    } catch (error) {
      logger.error('Error in AuthController.resetPassword:', error);
      next(error);
    }
  }

  /**
   * Logout user by clearing the refresh token cookie
   * @route POST /api/auth/logout
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Clear refresh and access tokens cookies
      await authService.logout(res);
      successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      logger.error('Error in AuthController.logout:', error);
      next(error);
    }
  }
}

export default new AuthController();
