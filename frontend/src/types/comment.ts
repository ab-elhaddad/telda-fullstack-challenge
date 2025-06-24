/**
 * Comment type definitions
 * Aligned with backend types
 */

/**
 * Comment interface
 */
export interface Comment {
  id: number;
  movie_id: number;
  user_id: number;
  content: string;
  rating: number;
  created_at: Date;
  updated_at: Date | null;
}

/**
 * Comment with user information
 */
export interface CommentWithUser extends Comment {
  user_name: string;
}

/**
 * Create comment data transfer object
 */
export interface CreateCommentDto {
  content: string;
  rating: number;
}

/**
 * Update comment data transfer object
 */
export interface UpdateCommentDto {
  content?: string;
  rating?: number;
}

/**
 * Comment query parameters
 */
export interface CommentQueryParams {
  movie_id?: number;
  user_id?: number;
  page?: number;
  limit?: number;
}

/**
 * Comments paginated response
 */
export interface CommentsPaginated {
  comments: CommentWithUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
