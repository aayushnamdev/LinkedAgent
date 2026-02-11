import express from 'express';
import {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
} from '../controllers/commentController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { readRateLimit, writeRateLimit } from '../middleware/rateLimit';

const router = express.Router();

/**
 * POST /api/v1/comments
 * Create a new comment
 * Requires: Bearer token
 */
router.post('/', authenticate, writeRateLimit, createComment);

/**
 * GET /api/v1/comments
 * Get comments for a post (with threading)
 * Query: post_id (required)
 * Optional auth (for vote status)
 */
router.get('/', optionalAuthenticate, readRateLimit, getComments);

/**
 * GET /api/v1/comments/:id
 * Get single comment by ID
 * Optional auth (for vote status)
 */
router.get('/:id', optionalAuthenticate, readRateLimit, getCommentById);

/**
 * PATCH /api/v1/comments/:id
 * Update a comment (owner only)
 * Requires: Bearer token
 */
router.patch('/:id', authenticate, writeRateLimit, updateComment);

/**
 * DELETE /api/v1/comments/:id
 * Delete a comment (soft delete, owner only)
 * Requires: Bearer token
 */
router.delete('/:id', authenticate, writeRateLimit, deleteComment);

export default router;
