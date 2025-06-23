import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import config from '@config/index';
import { UserPayload, RefreshTokenPayload } from '../types/auth';

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
  const refreshPayload: RefreshTokenPayload = {
    ...payload,
    jti: uuidv4(), // Add JWT ID for potential blacklisting
  };

  return jwt.sign(refreshPayload, config.jwtRefreshSecret, {
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
const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret) as RefreshTokenPayload;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate secure cookie options for refresh token
 */
const getRefreshTokenCookieOptions = (isProduction: boolean) => {
  return {
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: isProduction, // HTTPS only in production
    sameSite: 'lax' as const, // Protects against CSRF
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/auth', // Only available to auth routes
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
  getRefreshTokenCookieOptions,
};
