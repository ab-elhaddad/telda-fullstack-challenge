import { Request, Response, NextFunction } from 'express';
import commentService from '../services/comment.service';
import { CreateCommentDto, UpdateCommentDto } from '../types/comment';
import { successResponse, createdResponse } from '../utils/response';
import { Request as ExpressRequest } from 'express';

interface ExtendedRequest extends ExpressRequest {
  user?: { id: number; role: string };
}

class CommentController {
  /**
   * Create a new comment for a movie
   * @route POST /api/movies/:movieId/comments
   */
  async createComment(req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const movieId = parseInt(req.params.movieId);
      const data: CreateCommentDto = req.body;
      
      const comment = await commentService.createComment(userId, movieId, data);
      
      createdResponse(res, { comment }, 'Comment created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all comments for a movie
   * @route GET /api/movies/:movieId/comments
   */
  async getMovieComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movieId = parseInt(req.params.movieId);
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const result = await commentService.getComments({
        movie_id: movieId,
        page,
        limit
      });
      
      successResponse(res, result, 'Comments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a comment by ID
   * @route GET /api/comments/:commentId
   */
  async getCommentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = parseInt(req.params.commentId);
      const comment = await commentService.getCommentById(commentId);
      
      successResponse(res, { comment }, 'Comment retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a comment
   * @route PUT /api/comments/:commentId
   */
  async updateComment(req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const commentId = parseInt(req.params.commentId);
      const data: UpdateCommentDto = req.body;
      
      const comment = await commentService.updateComment(commentId, userId, data);
      
      successResponse(res, { comment }, 'Comment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a comment
   * @route DELETE /api/comments/:commentId
   */
  async deleteComment(req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const commentId = parseInt(req.params.commentId);
      
      await commentService.deleteComment(commentId, userId);
      
      successResponse(res, {}, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's comments
   * @route GET /api/comments/my
   */
  async getUserComments(req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const result = await commentService.getComments({
        user_id: userId,
        page,
        limit
      });
      
      successResponse(res, result, 'User comments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new CommentController();
