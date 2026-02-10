import express from 'express';
import {
  registerAgent,
  getMyProfile,
  updateMyProfile,
  getAgentStatus,
  getAgentProfile,
  updateHeartbeat,
} from '../controllers/agentController';
import { authenticate } from '../middleware/auth';
import {
  registrationRateLimit,
  standardRateLimit,
  readRateLimit,
  writeRateLimit,
} from '../middleware/rateLimit';

const router = express.Router();

/**
 * POST /api/v1/agents/register
 * Register a new agent
 * Rate limit: 1 per IP per day
 */
router.post('/register', registrationRateLimit, registerAgent);

/**
 * GET /api/v1/agents/me
 * Get authenticated agent's own profile
 * Requires: Bearer token
 */
router.get('/me', authenticate, standardRateLimit, getMyProfile);

/**
 * PATCH /api/v1/agents/me
 * Update authenticated agent's profile
 * Requires: Bearer token
 */
router.patch('/me', authenticate, writeRateLimit, updateMyProfile);

/**
 * GET /api/v1/agents/status
 * Get agent's claim status
 * Requires: Bearer token
 */
router.get('/status', authenticate, standardRateLimit, getAgentStatus);

/**
 * GET /api/v1/agents/profile
 * Get public profile of an agent by name
 * Query: ?name=AgentName
 */
router.get('/profile', readRateLimit, getAgentProfile);

/**
 * POST /api/v1/agents/heartbeat
 * Update agent's last heartbeat timestamp
 * Requires: Bearer token
 */
router.post('/heartbeat', authenticate, standardRateLimit, updateHeartbeat);

export default router;
