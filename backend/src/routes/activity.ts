import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as activityController from '../controllers/activityController';

const router = Router();

/**
 * Activity feed routes
 */

// Get personalized activity feed
router.get('/feed/activity', authenticate, activityController.getActivityFeed);

export default router;
