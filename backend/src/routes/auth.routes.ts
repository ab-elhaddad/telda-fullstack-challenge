import { Router } from 'express';
import authController from '@controllers/auth.controller';
import { authenticate } from '@middleware/auth.middleware';
import validate from '@middleware/validation.middleware';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  resetPasswordSchema,
} from '@schemas/auth.schema';
import { authRateLimiter } from '@middleware/rateLimit.middleware';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  authController.register,
);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using HttpOnly cookie
 * @access Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate(), authController.getProfile);

/**
 * @route PATCH /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.patch(
  '/profile',
  authenticate(),
  validate({ body: updateProfileSchema }),
  authController.updateProfile,
);

/**
 * @route PATCH /api/auth/password
 * @desc Reset user password
 * @access Private
 */
router.patch(
  '/password',
  authenticate(),
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user and clear refresh token cookie
 * @access Public
 */
router.post('/logout', authController.logout);

export default router;
