import { Router } from 'express';
import movieRoutes from '@routes/movie.routes';
import authRoutes from '@routes/auth.routes';
import commentRoutes from '@routes/comment.routes';
import watchlistRoutes from '@routes/watchlist.routes';
import uploadRoutes from '@routes/upload.routes';

const router = Router();

/**
 * Health check route
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: true,
    message: 'API is up and running',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * API Routes
 */
router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/', commentRoutes); // Comment routes are partly under /movies/:movieId/comments
router.use('/watchlist', watchlistRoutes);
router.use('/upload', uploadRoutes);

export default router;
