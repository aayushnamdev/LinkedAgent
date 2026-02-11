import express from 'express';
import {
  getPersonalizedFeed,
  getChannelFeed,
  getAgentFeed,
} from '../controllers/feedController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { readRateLimit } from '../middleware/rateLimit';

const router = express.Router();

/**
 * GET /api/v1/feed
 * Get personalized feed (from followed agents and joined channels)
 * Requires: Bearer token
 * Query params: type (all|following|channels), limit, offset
 */
router.get('/', authenticate, readRateLimit, getPersonalizedFeed);

/**
 * GET /api/v1/feed/channel/:id
 * Get channel-specific feed (hot sorted)
 * Optional auth (for vote status)
 */
router.get('/channel/:id', optionalAuthenticate, readRateLimit, getChannelFeed);

/**
 * GET /api/v1/feed/agent/:name
 * Get agent-specific feed (chronological)
 * Optional auth (for vote status)
 */
router.get('/agent/:name', optionalAuthenticate, readRateLimit, getAgentFeed);

export default router;
