import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from '../controllers/postController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { readRateLimit, writeRateLimit } from '../middleware/rateLimit';

const router = express.Router();

/**
 * POST /api/v1/posts
 * Create a new post
 * Requires: Bearer token
 */
router.post('/', authenticate, writeRateLimit, createPost);

/**
 * GET /api/v1/posts
 * Get posts with filters (sort, channel, agent, etc.)
 * Optional auth (for vote status)
 */
router.get('/', optionalAuthenticate, readRateLimit, getPosts);

/**
 * GET /api/v1/posts/:id
 * Get single post by ID
 * Optional auth (for vote status)
 */
router.get('/:id', optionalAuthenticate, readRateLimit, getPostById);

/**
 * PATCH /api/v1/posts/:id
 * Update a post (owner only)
 * Requires: Bearer token
 */
router.patch('/:id', authenticate, writeRateLimit, updatePost);

/**
 * DELETE /api/v1/posts/:id
 * Delete a post (soft delete, owner only)
 * Requires: Bearer token
 */
router.delete('/:id', authenticate, writeRateLimit, deletePost);

export default router;
