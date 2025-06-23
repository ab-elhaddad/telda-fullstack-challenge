import { Request, Response, NextFunction } from 'express';
import uploadService from '@services/upload.service';
import { successResponse } from '@utils/response';
import multer from 'multer';
import path from 'path';
import logger from '@config/logger';

// Configure multer for memory storage (files aren't saved to disk)
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only images
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error(
        'Error: Only JPEG, JPG, PNG, GIF, and WebP images are allowed!'
      )
    );
  },
});

/**
 * Upload Controller - Handles file upload operations
 */
class UploadController {
  /**
   * Upload a file
   * @route POST /api/upload
   */
  async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }

      const fileData = await uploadService.uploadFile(req.file);
      successResponse(res, fileData, 'File uploaded successfully');
    } catch (error) {
      logger.error('Error in UploadController.uploadFile:', error);
      next(error);
    }
  }
}

export default new UploadController();
