/**
 * Comment service for handling comment-related API requests
 */
import apiService from "./api.service";
import { 
  CommentWithUser, 
  CreateCommentDto, 
  UpdateCommentDto, 
  CommentsPaginated
} from "../types/comment";

/**
 * Service for handling comment-related operations
 */
class CommentService {
  /**
   * Get comments for a movie
   */
  async getMovieComments(movieId: number, page = 1, limit = 10) {
    return apiService.get<CommentsPaginated>("/comments", {
      params: {
        movie_id: movieId.toString(),
        page: page.toString(),
        limit: limit.toString()
      }
    });
  }

  /**
   * Add a comment to a movie
   */
  async addComment(movieId: number, data: CreateCommentDto) {
    return apiService.post<CommentWithUser>(`/movies/${movieId}/comments`, data);
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: number, data: UpdateCommentDto) {
    return apiService.put<CommentWithUser>(`/comments/${commentId}`, data);
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number) {
    return apiService.delete<{ success: boolean }>(`/comments/${commentId}`);
  }

  /**
   * Get a specific comment
   */
  async getComment(commentId: number) {
    return apiService.get<CommentWithUser>(`/comments/${commentId}`);
  }

  /**
   * Get comments by current user
   */
  async getUserComments(page = 1, limit = 10) {
    return apiService.get<CommentsPaginated>("/user/comments", {
      params: {
        page: page.toString(),
        limit: limit.toString()
      }
    });
  }
}

export const commentService = new CommentService();
export default commentService;
