# Code Documentation Guide

This guide outlines the standards and best practices for documenting code in the Movie Application project. Consistent documentation improves code maintainability, onboarding of new developers, and overall project quality.

## Table of Contents

1. [General Principles](#general-principles)
2. [JSDoc Comments](#jsdoc-comments)
3. [TypeScript Types](#typescript-types)
4. [Component Documentation](#component-documentation)
5. [API Services Documentation](#api-services-documentation)
6. [File Structure](#file-structure)

## General Principles

- Write documentation as you code, not afterward
- Update documentation when you change code
- Focus on explaining "why" rather than "what" (the code shows what it does)
- Use clear, concise language
- Include examples for complex or non-obvious functionality
- Keep documentation close to the code it describes

## JSDoc Comments

Use JSDoc comments for functions, classes, and interfaces to provide:
- Description of purpose
- Parameter descriptions
- Return value descriptions
- Examples when helpful
- Thrown exceptions

### Function Example

```typescript
/**
 * Authenticates a user with email/username and password
 * 
 * @param login - Email or username of the user
 * @param password - User's password
 * @returns Promise resolving to user data on success
 * @throws {AuthError} When credentials are invalid
 * 
 * @example
 * ```
 * const userData = await authenticateUser('john@example.com', 'password123');
 * ```
 */
async function authenticateUser(login: string, password: string): Promise<User> {
  // Implementation
}
```

### Interface Example

```typescript
/**
 * Represents a movie in the application
 */
interface Movie {
  /** Unique identifier of the movie */
  id: number;
  /** Full title of the movie */
  title: string;
  /** Director's full name */
  director: string;
  /** Release year (YYYY format) */
  year: number;
  /** Average rating from 1-10 */
  rating: number;
  /** URL to movie poster image */
  posterUrl?: string;
}
```

### Class Example

```typescript
/**
 * Handles API requests to the authentication endpoints
 */
class AuthService {
  /**
   * Base URL for authentication endpoints
   * @private
   */
  private baseUrl: string;
  
  /**
   * Creates a new AuthService instance
   * @param apiClient - The HTTP client to use for requests
   */
  constructor(private apiClient: ApiClient) {
    this.baseUrl = '/api/auth';
  }
  
  // Methods with their own JSDoc comments...
}
```

## TypeScript Types

- Use descriptive type names that indicate the purpose
- Prefer interfaces for object types that will be used throughout the codebase
- Use type aliases for unions, intersections, and specific use cases
- Document complex types with JSDoc comments
- Export types that are used across multiple files
- Follow the API response structure pattern consistently

### API Response Type Pattern

Remember that our API follows a standard response pattern:

```typescript
/**
 * Generic API response wrapper
 * @template T Type of the data contained in the response
 */
interface ApiResponse<T> {
  /** Whether the request was successful */
  status: boolean;
  /** Human-readable message about the result */
  message: string;
  /** The actual response data */
  data: T;
}

// When using with React Query:
const { data: responseData, isLoading } = useQuery(
  ["profile"],
  () => authService.getProfile()
);

// Correctly accessing the nested data:
const userData = responseData?.data;
```

## Component Documentation

For React components, include:

1. Purpose and functionality
2. Props with descriptions
3. State variables and what they represent
4. Side effects and their triggers
5. Notable internal functions

### Example

```typescript
/**
 * Displays user profile information with editable fields
 * 
 * @component
 * @example
 * ```tsx
 * <PersonalInfoCard 
 *   userData={userData} 
 *   isLoading={false} 
 *   onSave={handleSave} 
 * />
 * ```
 */
export function PersonalInfoCard({ 
  userData, 
  isLoading, 
  onSave 
}: PersonalInfoCardProps) {
  // Implementation
}

/**
 * Props for the PersonalInfoCard component
 */
interface PersonalInfoCardProps {
  /** User data to display and edit */
  userData: User | undefined;
  /** Whether the data is currently loading */
  isLoading: boolean;
  /** Callback fired when the user saves changes */
  onSave: (data: UpdateProfileData) => void;
}
```

## API Services Documentation

Document API services with:

1. Purpose of the service
2. Each API method with parameters and return type
3. Error handling approach
4. Authentication requirements

### Example

```typescript
/**
 * Service for user authentication and profile management
 */
export const authService = {
  /**
   * Retrieves the current user's profile
   * 
   * @returns Promise resolving to user data
   * @throws {Error} When user is not authenticated or request fails
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await authApi.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },
  
  /**
   * Updates user profile information
   * 
   * @param data - Profile data to update
   * @returns Promise resolving to updated user data
   * @throws {Error} When update fails or validation errors occur
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await authApi.patch<ApiResponse<User>>("/auth/profile", data);
    return response.data.data;
  },
}
```

## File Structure

### File Headers

Include a file header comment at the top of each file:

```typescript
/**
 * @file ProfilePage component that displays user information and settings
 * @author TeamMember Name <email@example.com>
 * @module pages/profile
 */
```

### Directory Structure Documentation

For new directories, include a README.md that explains:

1. Purpose of the directory
2. Main components/files and their roles
3. How the contained code interacts with other parts of the application

### Example Directory README

```markdown
# Profile Components

This directory contains components related to the user profile page.

## Components

- `ProfilePage.tsx`: Container component that manages state and composes child components
- `PersonalInfoCard.tsx`: Form for editing personal information
- `SecurityCard.tsx`: Security settings including password change
- `DangerZoneCard.tsx`: Critical account actions like deletion
- `ChangePasswordModal.tsx`: Modal dialog for password changes

## State Management

Profile data is fetched with React Query and passed down to child components.
Form state is managed locally within each component using React Hook Form.
```

---

## Practical Documentation Checklist

Before submitting code, ensure that you have:

- [ ] Added JSDoc comments to all exported functions, classes, and types
- [ ] Documented complex internal functions
- [ ] Added component documentation for props and behavior
- [ ] Updated relevant README files if adding new features or directories
- [ ] Checked that types accurately reflect the data structures
- [ ] Verified that API service documentation matches the actual endpoints
