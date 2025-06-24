/**
 * User payload for JWT access tokens
 * Aligned with backend UserPayload
 */
export interface UserPayload {
  id: string;
  email: string;
  username: string;
  role: string;
}

/**
 * User-related types
 */
export interface User {
  id: string; // Changed from number to string to match backend
  name: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
  created_at?: Date; // Changed from string to Date for consistency
  updated_at?: Date; // Changed from string to Date for consistency
}

/**
 * Authentication tokens response
 * Aligned with backend AuthTokens
 */
export interface AuthTokens {
  accessToken: string; // Changed from access_token to match backend
  expiresIn: string;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
}

/**
 * Login credentials
 * Aligned with backend LoginCredentials
 */
export type LoginCredentials = {
  identifier: string;
  password: string;
};

/**
 * Registration data
 * Aligned with backend RegistrationData
 */
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

/**
 * Profile update data
 * Aligned with backend UpdateProfileData
 */
export interface UpdateProfileData {
  username?: string;
  email?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  oldPassword?: string;
  newPassword?: string;
}

/**
 * Password update data (Frontend-specific)
 */
export interface UpdatePasswordData {
  oldPassword: string; // Changed to match naming in UpdateProfileData
  newPassword: string; // Changed to match naming in UpdateProfileData
  confirmPassword: string;
}

// Auth state types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
