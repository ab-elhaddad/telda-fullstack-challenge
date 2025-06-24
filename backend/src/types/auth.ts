export interface UserPayload {
  id: string;
  email: string;
  username: string;
  role: string;
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
  name: string;
}

export interface UpdateProfileData {
  name?: string;
  avatarUrl?: string;
}
