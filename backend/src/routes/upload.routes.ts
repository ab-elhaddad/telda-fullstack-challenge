import { Router } from 'express';
import uploadController, { upload } from '@controllers/upload.controller';
import { authenticate } from '@middleware/auth.middleware';

const router = Router();

/**
 * @route POST /api/upload
 * @desc Upload a file (image)
 * @access Private (requires authentication)
 */
router.post(
  '/',
  authenticate,
  upload.single('file'),
  uploadController.uploadFile
);

export default router;
