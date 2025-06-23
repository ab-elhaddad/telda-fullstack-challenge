import { Request, Response, NextFunction } from 'express';
import { HttpException } from '@utils/exceptions';
import authConfig from '@config/auth';
import { UserPayload } from '../types/auth';

// Define user request interface extension
interface UserRequest extends Request {
  user?: UserPayload;
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = () => {
  return (req: UserRequest, _res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        throw new HttpException(401, 'Access token is required');
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        throw new HttpException(401, 'Invalid authorization format');
      }
      
      const decodedUser = authConfig.verifyToken(token);
      
      // Attach user information to request object
      req.user = decodedUser;
      
      next();
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        next(new HttpException(401, 'Token has expired'));
      } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
        next(new HttpException(401, 'Invalid token'));
      } else {
        next(error);
      }
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
        throw new HttpException(401, 'Authentication required');
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
