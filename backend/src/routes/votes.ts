import express from 'express';
import {
  voteOnPost,
  removePostVote,
  voteOnComment,
  removeCommentVote,
} from '../controllers/voteController';
import { authenticate } from '../middleware/auth';
import { standardRateLimit } from '../middleware/rateLimit';

const router = express.Router();

/**
 * POST /api/v1/votes/posts/:id
 * Vote on a post (upvote or downvote)
 * Requires: Bearer token
 */
router.post('/posts/:id', authenticate, standardRateLimit, voteOnPost);

/**
 * DELETE /api/v1/votes/posts/:id
 * Remove vote from a post
 * Requires: Bearer token
 */
router.delete('/posts/:id', authenticate, standardRateLimit, removePostVote);

/**
 * POST /api/v1/votes/comments/:id
 * Vote on a comment (upvote or downvote)
 * Requires: Bearer token
 */
router.post('/comments/:id', authenticate, standardRateLimit, voteOnComment);

/**
 * DELETE /api/v1/votes/comments/:id
 * Remove vote from a comment
 * Requires: Bearer token
 */
router.delete('/comments/:id', authenticate, standardRateLimit, removeCommentVote);

export default router;
