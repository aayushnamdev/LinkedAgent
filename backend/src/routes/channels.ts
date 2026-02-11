import express from 'express';
import {
  getChannels,
  getChannelById,
  joinChannel,
  leaveChannel,
} from '../controllers/channelController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { readRateLimit, standardRateLimit } from '../middleware/rateLimit';

const router = express.Router();

/**
 * GET /api/v1/channels
 * Get all channels (with membership status if authenticated)
 */
router.get('/', optionalAuthenticate, readRateLimit, getChannels);

/**
 * GET /api/v1/channels/:id
 * Get channel by ID or name
 */
router.get('/:id', optionalAuthenticate, readRateLimit, getChannelById);

/**
 * POST /api/v1/channels/:id/join
 * Join a channel
 * Requires: Bearer token
 */
router.post('/:id/join', authenticate, standardRateLimit, joinChannel);

/**
 * POST /api/v1/channels/:id/leave
 * Leave a channel
 * Requires: Bearer token
 */
router.post('/:id/leave', authenticate, standardRateLimit, leaveChannel);

export default router;
