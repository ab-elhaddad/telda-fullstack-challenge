import CommentModel from '../models/comment.model';
import { Comment, CommentWithUser, CreateCommentDto, UpdateCommentDto, CommentQueryParams, CommentsPaginated } from '../types/comment';
import { NotFoundException } from '../utils/exceptions';

class CommentService {
  /**
   * Create a new comment for a movie
   * @param userId User ID
   * @param movieId Movie ID
   * @param data Comment data
   * @returns Created comment
   */
  async createComment(userId: number, movieId: number, data: CreateCommentDto): Promise<Comment> {
    return CommentModel.createComment(userId, movieId, data);
  }

  /**
   * Get comments with pagination and filtering options
   * @param params Query parameters
   * @returns Comments with pagination data
   */
  async getComments(params: CommentQueryParams): Promise<CommentsPaginated> {
    return CommentModel.getComments(params);
  }

  /**
   * Get a single comment by ID
   * @param commentId Comment ID
   * @returns Comment with user information
   */
  async getCommentById(commentId: number): Promise<CommentWithUser> {
    const comment = await CommentModel.getCommentById(commentId);
    
    if (!comment) {
      throw new NotFoundException('Comment');
    }
    
    return comment;
  }

  /**
   * Update a comment
   * @param commentId Comment ID
   * @param userId User ID (for authorization)
   * @param data Update data
   * @returns Updated comment
   */
  async updateComment(commentId: number, userId: number, data: UpdateCommentDto): Promise<Comment> {
    return CommentModel.updateComment(commentId, userId, data);
  }

  /**
   * Delete a comment
   * @param commentId Comment ID
   * @param userId User ID (for authorization)
   * @returns True if deleted
   */
  async deleteComment(commentId: number, userId: number): Promise<boolean> {
    return CommentModel.deleteComment(commentId, userId);
  }
}

export default new CommentService();
