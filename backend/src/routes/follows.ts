import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as followController from '../controllers/followController';

const router = Router();

// Follow/unfollow actions (require authentication)
router.post('/agents/:id/follow', authenticate, followController.followAgent);
router.delete('/agents/:id/follow', authenticate, followController.unfollowAgent);

// Get followers/following lists (public)
router.get('/agents/:id/followers', followController.getFollowers);
router.get('/agents/:id/following', followController.getFollowing);

// Get follow stats (optional auth for is_following check)
router.get('/agents/:id/stats/follow', authenticate, followController.getFollowStats);

export default router;
