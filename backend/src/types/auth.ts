/**
 * User payload for JWT access tokens
 */
export interface UserPayload {
  id: string;
  email: string;
  username: string;
  role: string;
}

/**
 * Authentication tokens response
 */
export interface AuthTokens {
  accessToken: string;
  expiresIn: string;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    profilePictureUrl?: string;
  };
}

/**
 * Refresh token payload with JWT ID for potential blacklisting
 */
export interface RefreshTokenPayload extends UserPayload {
  jti: string; // JWT ID for potential blacklisting
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  identifier: string; // Can be email or username
  password: string;
}

/**
 * Registration data
 */
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  name: string;
}

/**
 * Profile update data
 */
export interface UpdateProfileData {
  username?: string;
  email?: string;
  name?: string;
  bio?: string;
  profile_picture_url?: string;
  oldPassword?: string;
  newPassword?: string;
}
