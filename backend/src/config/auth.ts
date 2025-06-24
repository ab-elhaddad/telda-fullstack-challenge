import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '@config/index';
import { UserPayload } from '../types/auth';

/**
 * Generate access token for authentication
 */
const generateAccessToken = (payload: UserPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '15m',
  });
};

/**
 * Generate refresh token with JWT ID for potential blacklisting
 */
const generateRefreshToken = (payload: UserPayload): string => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: '1d',
  });
};

/**
 * Verify JWT token and return decoded data
 */
const verifyToken = (token: string): UserPayload => {
  try {
    return jwt.verify(token, config.jwtSecret) as UserPayload;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify refresh token and return decoded data
 */
const verifyRefreshToken = (token: string): UserPayload => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret) as UserPayload;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate secure cookie options for token
 */
const getTokenCookieOptions = (isProduction: boolean) => {
  return {
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: isProduction, // HTTPS only in production
    sameSite: 'lax' as const, // Protects against CSRF
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  };
};

/**
 * Hash password
 */
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  getTokenCookieOptions,
};
