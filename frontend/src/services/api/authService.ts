import apiClient from './apiClient';
import {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  UpdatePasswordData
} from '@/types/auth';

/**
 * Authentication service for handling user authentication and profile management
 */
class AuthService {
  private AUTH_ENDPOINT = '/auth';
  
  /**
   * Register a new user account
   * @param userData User registration data
   * @returns User and token data
   */
  async register(userData: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    // Convert from frontend naming to backend naming for confirmPassword
    const backendData = {
      ...userData,
      confirm_password: userData.confirmPassword
    };
    
    delete (backendData as any).confirmPassword;
    
    return await apiClient.post(`${this.AUTH_ENDPOINT}/register`, backendData);
  }
  
  /**
   * Log in an existing user
   * @param credentials Login credentials (email and password)
   * @returns Authentication tokens and user data
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post(`${this.AUTH_ENDPOINT}/login`, credentials);
    
    // Store the access token in localStorage for future requests
    if (response.tokens?.access_token) {
      localStorage.setItem('accessToken', response.tokens.access_token);
    }
    
    return response;
  }
  
  /**
   * Refresh the access token using the HttpOnly refresh token cookie
   * @returns New access token
   */
  async refreshToken(): Promise<AuthTokens> {
    const tokens = await apiClient.post<AuthTokens>(`${this.AUTH_ENDPOINT}/refresh`);
    
    if (tokens.access_token) {
      localStorage.setItem('accessToken', tokens.access_token);
    }
    
    return tokens;
  }
  
  /**
   * Get the current user's profile
   * @returns User profile data
   */
  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>(`${this.AUTH_ENDPOINT}/me`);
  }
  
  /**
   * Update the current user's profile information
   * @param profileData Profile data to update
   * @returns Updated user profile
   */
  async updateProfile(profileData: UpdateProfileData): Promise<User> {
    return await apiClient.put<User>(`${this.AUTH_ENDPOINT}/profile`, profileData);
  }
  
  /**
   * Update the current user's password
   * @param passwordData Current and new password data
   * @returns Success message
   */
  async updatePassword(passwordData: UpdatePasswordData): Promise<{ message: string }> {
    // Convert from camelCase to snake_case if needed
    const backendData = {
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
      confirm_password: passwordData.confirm_password
    };
    
    return await apiClient.put<{ message: string }>(`${this.AUTH_ENDPOINT}/password`, backendData);
  }
  
  /**
   * Log out the current user
   * @returns Success indicator
   */
  async logout(): Promise<void> {
    await apiClient.post(`${this.AUTH_ENDPOINT}/logout`);
    localStorage.removeItem('accessToken');
  }
  
  /**
   * Check if the user is authenticated based on token presence
   * Not a reliable security measure, just a UI convenience
   * @returns Whether a token exists
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
