import { Response } from 'express';
import UserModel from '../models/user.model';
import authConfig from '../config/auth';
import config from '../config/index';
import { LoginCredentials, RegistrationData, AuthTokens, UserPayload } from '../types/auth';
import { ConflictException, NotFoundException, UnauthorizedException } from '../utils/exceptions';
import logger from '../config/logger';

/**
 * Authentication service - handles user registration, login, and token management
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(
    userData: RegistrationData,
  ): Promise<{ id: string; username: string; email: string; name: string }> {
    try {
      // Check if email already exists
      const emailExists = await UserModel.emailExists(userData.email);
      if (emailExists) {
        throw new ConflictException('User with this email');
      }

      // Check if username already exists
      const usernameExists = await UserModel.usernameExists(userData.username);
      if (usernameExists) {
        throw new ConflictException('User with this username');
      }

      // Create the user
      const user = await UserModel.create({
        username: userData.username,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'user', // Default role
      });

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      logger.error('Error in AuthService.register:', error);
      throw error;
    }
  }

  /**
   * Login a user with identifier (email or username) and password
   */
  async login(credentials: LoginCredentials, res: Response): Promise<AuthTokens> {
    try {
      // Find user by identifier (email or username)
      const user = await UserModel.findByIdentifier(credentials.identifier);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await authConfig.comparePassword(credentials.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate tokens
      const tokenPayload: UserPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const accessToken = authConfig.generateAccessToken(tokenPayload);
      const refreshToken = authConfig.generateRefreshToken(tokenPayload);

      // Set refresh token as HttpOnly cookie
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('refresh_token', refreshToken, authConfig.getTokenCookieOptions(isProduction));
      res.cookie('access_token', accessToken, authConfig.getTokenCookieOptions(isProduction));

      return {
        accessToken,
        expiresIn: config.jwtExpiresIn,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatar_url,
        },
      };
    } catch (error) {
      logger.error('Error in AuthService.login:', error);
      throw error;
    }
  }

  /**
   * Refresh an access token using a refresh token from cookie
   */
  async refreshToken(token: string, res: Response): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = authConfig.verifyRefreshToken(token);

      // Check if user still exists - this is the only DB interaction for stateless tokens
      const user = await UserModel.findById(decoded.id);

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      // Generate new tokens
      const tokenPayload: UserPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const accessToken = authConfig.generateAccessToken(tokenPayload);
      const refreshToken = authConfig.generateRefreshToken(tokenPayload);

      // Set new refresh token as HttpOnly cookie (token rotation)
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('refresh_token', refreshToken, authConfig.getTokenCookieOptions(isProduction));
      res.cookie('access_token', accessToken, authConfig.getTokenCookieOptions(isProduction));

      return {
        accessToken,
        expiresIn: config.jwtExpiresIn,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatar_url,
        },
      };
    } catch (error) {
      logger.error('Error in AuthService.refreshToken:', error);

      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired, please login again');
      }

      if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      throw error;
    }
  }

  /**
   * Logout user by clearing refresh token cookie
   */
  async logout(res: Response): Promise<void> {
    try {
      // Clear the refresh token cookie
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
      res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
    } catch (error) {
      logger.error('Error in AuthService.logout:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<{
    id: string;
    username: string;
    email: string;
    name: string;
    bio?: string;
    avatar_url?: string;
    role: string;
  }> {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new NotFoundException('User');
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatar_url: user.avatar_url,
        role: user.role,
      };
    } catch (error) {
      logger.error(`Error fetching user profile for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user profile (only name and avatar)
   */
  async updateProfile(
    userId: string,
    data: { name?: string; avatarUrl?: string },
  ): Promise<{
    id: string;
    username: string;
    email: string;
    name: string;
    bio?: string;
    avatar_url?: string;
    role: string;
  }> {
    try {
      // Verify user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User');
      }

      // Only handle profile fields (name, avatarUrl)
      const updateData: any = { ...data };

      // Map avatarUrl to avatar_url if it exists
      if (updateData.avatarUrl !== undefined) {
        updateData.avatar_url = updateData.avatarUrl;
        delete updateData.avatarUrl;
      }

      // Update profile
      const updatedUser = await UserModel.updateProfile(userId, updateData);

      return {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        bio: updatedUser.bio,
        avatar_url: updatedUser.avatar_url,
        role: updatedUser.role,
      };
    } catch (error) {
      logger.error(`Error updating profile for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      // Verify user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User');
      }

      // Verify old password
      const isPasswordValid = await authConfig.comparePassword(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await authConfig.hashPassword(newPassword);

      // Update user with new password
      await UserModel.updateProfile(userId, { password: hashedPassword });
    } catch (error) {
      logger.error(`Error resetting password for user ${userId}:`, error);
      throw error;
    }
  }
}

export default new AuthService();
