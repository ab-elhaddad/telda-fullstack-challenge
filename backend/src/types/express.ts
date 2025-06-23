import { Request } from 'express';
import { UserPayload } from './auth';

/**
 * Extends Express Request with user property from auth middleware
 */
export interface UserRequest extends Request {
  user?: UserPayload;
}
