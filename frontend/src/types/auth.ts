export interface UserPayload {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuthTokens {
  accessToken: string;
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

export type LoginCredentials = {
  identifier: string;
  password: string;
};

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface UpdateProfileData {
  name?: string;
  avatarUrl?: string;
}

export interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
