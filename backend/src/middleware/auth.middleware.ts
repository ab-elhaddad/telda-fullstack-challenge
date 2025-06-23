import { Request, Response, NextFunction } from 'express';
import { HttpException, UnauthorizedException } from '@utils/exceptions';
import authConfig from '@config/auth';
import authService from '@services/auth.service';
import { UserPayload } from '../types/auth';
import logger from '@config/logger';

// Define user request interface extension
export interface UserRequest extends Request {
  user?: UserPayload;
}

/**
 * Middleware to authenticate requests using JWT with automatic token refresh
 *
 * This middleware will:
 * 1. Check for access token in Authorization header or cookie
 * 2. If access token is valid, continue the request
 * 3. If access token has expired, try to use refresh token from cookie to get a new access token
 * 4. If refresh token is valid, generate new tokens and continue the request
 * 5. If refresh token is expired or invalid, return unauthorized response
 */
export const authenticate = () => {
  return async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
    logger.debug('Authenticate middleware executing');
    try {
      // Get access token from cookie
      const accessToken = req.cookies?.access_token;

      // If no access token found in cookie
      if (!accessToken) {
        logger.debug('No access token found in cookies');
        throw new UnauthorizedException('Access token is required');
      }

      try {
        // Try to verify the access token
        const decodedUser = authConfig.verifyToken(accessToken);

        // Valid token - attach user to request and continue
        req.user = decodedUser;
        return next();
      } catch (tokenError) {
        // If access token is expired, try refresh flow
        if (tokenError instanceof Error && tokenError.name === 'TokenExpiredError') {
          logger.debug('Access token expired, attempting refresh');

          // Get refresh token from cookie
          const refreshToken = req.cookies?.refresh_token;

          if (!refreshToken) {
            logger.debug('No refresh token found in cookies');
            throw new UnauthorizedException('Session expired. Please login again');
          }

          try {
            // Try to refresh the tokens
            const tokens = await authService.refreshToken(refreshToken, res);

            // Set the new token in the request for this current request
            const newDecodedUser = authConfig.verifyToken(tokens.accessToken);
            req.user = newDecodedUser;

            // New tokens are already set as cookies by the refreshToken service

            // Continue with the request
            return next();
          } catch (refreshError) {
            // If refresh token is invalid or expired
            logger.debug('Failed to refresh token', refreshError);
            throw new UnauthorizedException('Authentication failed. Please login again');
          }
        } else if (tokenError instanceof Error && tokenError.name === 'JsonWebTokenError') {
          // Invalid token format or signature
          throw new UnauthorizedException('Invalid token format or signature');
        } else {
          // Other token verification error
          throw tokenError;
        }
      }
    } catch (error) {
      // Clear cookies on authentication failure
      if (error instanceof UnauthorizedException) {
        res.clearCookie('access_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/api/auth',
        });

        res.clearCookie('refresh_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/api/auth',
        });
      }

      next(error);
    }
  };
};

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = () => {
  return (req: UserRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedException('Authentication required');
      }

      if (req.user.role !== 'admin') {
        throw new HttpException(403, 'Requires admin privileges');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
