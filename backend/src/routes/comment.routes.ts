import { Router } from 'express';
import commentController from '@controllers/comment.controller';
import validate from '@middleware/validation.middleware';
import { createCommentSchema, updateCommentSchema, commentQueryParamsSchema } from '@schemas/comment.schema';
import { authenticate } from '@middleware/auth.middleware';

const router = Router();

// Routes for specific movie's comments
router.get(
  '/movies/:movieId/comments',
  validate(commentQueryParamsSchema),
  commentController.getMovieComments
);

router.post(
  '/movies/:movieId/comments',
  authenticate,
  validate(createCommentSchema),
  commentController.createComment
);

// Routes for handling individual comments
router.get(
  '/comments/:commentId',
  commentController.getCommentById
);

router.put(
  '/comments/:commentId',
  authenticate,
  validate(updateCommentSchema),
  commentController.updateComment
);

router.delete(
  '/comments/:commentId',
  authenticate,
  commentController.deleteComment
);

// Route for getting current user's comments
router.get(
  '/comments/my',
  authenticate,
  validate(commentQueryParamsSchema),
  commentController.getUserComments
);

export default router;
